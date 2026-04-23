import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { logError, logWarn } from '@/lib/logger';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 15;
const requestTracker = new Map();

const ALLOWED_LAYERS = new Set(["tezos", "etherlink"]);
const MAX_TWITTER_HANDLE_LENGTH = 32;

function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(clientIp) {
  const now = Date.now();
  const existing = requestTracker.get(clientIp);

  if (!existing || now > existing.expiresAt) {
    requestTracker.set(clientIp, {
      count: 1,
      expiresAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  existing.count += 1;
  requestTracker.set(clientIp, existing);
  return existing.count > RATE_LIMIT_MAX_REQUESTS;
}

function isValidAddress(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  const isTezos = /^tz[1-3][1-9A-Za-z]{33}$/.test(trimmed);
  const isEvm = /^0x[a-fA-F0-9]{40}$/.test(trimmed);
  return isTezos || isEvm;
}

function sanitizeTwitterHandle(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/^@/, "");
  if (!trimmed) return null;
  if (!/^[A-Za-z0-9_]{1,32}$/.test(trimmed)) return null;
  return trimmed;
}

function isValidHttpUrl(value) {
  if (typeof value !== "string" || !value) {
    return false;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function validatePayload(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, message: "Invalid payload." };
  }

  const { address, archetype, layer, onboarding_answers, twitter_handle } = body;

  if (!isValidAddress(address)) {
    return { valid: false, message: "A valid wallet address is required." };
  }

  if (archetype != null && (typeof archetype !== "string" || archetype.length > 80)) {
    return { valid: false, message: "Invalid archetype value." };
  }

  if (layer != null && (!ALLOWED_LAYERS.has(layer))) {
    return { valid: false, message: "Invalid layer value." };
  }

  if (onboarding_answers != null && typeof onboarding_answers !== "object") {
    return { valid: false, message: "Invalid onboarding answers." };
  }

  if (twitter_handle != null) {
    const normalized = sanitizeTwitterHandle(twitter_handle);
    if (!normalized || normalized.length > MAX_TWITTER_HANDLE_LENGTH) {
      return { valid: false, message: "Invalid Twitter handle." };
    }
  }

  return { valid: true };
}

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!isValidHttpUrl(supabaseUrl) || !supabaseKey) {
      logError("Auth API misconfigured");
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    const clientIp = getClientIp(request);
    if (isRateLimited(clientIp)) {
      logWarn("Rate limit hit", { clientIp });
      return NextResponse.json({ error: "Too many requests. Please try again soon." }, { status: 429 });
    }

    const payload = await request.json();
    const validation = validatePayload(payload);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    const { address, archetype, layer, onboarding_answers, twitter_handle } = payload;

    const normalizedAddress = address.trim();
    const normalizedTwitter = sanitizeTwitterHandle(twitter_handle);

    // Build update object dynamically to avoid overwriting with nulls
    const updateData = { 
      wallet_address: normalizedAddress,
      updated_at: new Date().toISOString()
    };
    
    if (archetype) updateData.archetype = archetype.trim();
    if (layer) updateData.last_layer = layer;
    if (onboarding_answers) updateData.onboarding_answers = onboarding_answers;
    if (normalizedTwitter) updateData.twitter_handle = normalizedTwitter;

    // Upsert user profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert(updateData, { onConflict: 'wallet_address' })
      .select("id,wallet_address,archetype,last_layer,onboarding_answers,twitter_handle,created_at,updated_at");

    if (error) {
      logError("Auth upsert failed", { code: error.code });
      return NextResponse.json({ error: "Could not save profile." }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data[0] });
  } catch {
    logError("Auth API unexpected failure");
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}

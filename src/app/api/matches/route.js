import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { computeCompatibility } from "@/lib/matching";
import { logError } from "@/lib/logger";

const PROFILE_COLUMNS = "id,wallet_address,archetype,last_layer,onboarding_answers,twitter_handle,created_at,updated_at";

function isValidAddress(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  const isTezos = /^tz[1-3][1-9A-Za-z]{33}$/.test(trimmed);
  const isEvm = /^0x[a-fA-F0-9]{40}$/.test(trimmed);
  return isTezos || isEvm;
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

export async function POST(request) {
  try {
    const { address, limit = 10 } = await request.json();
    if (!isValidAddress(address)) {
      return NextResponse.json({ error: "A valid wallet address is required." }, { status: 400 });
    }

    const safeLimit = Math.max(1, Math.min(20, Number(limit) || 10));
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!isValidHttpUrl(supabaseUrl) || !supabaseKey) {
      logError("Matches API misconfigured");
      return NextResponse.json({ error: "Database configuration missing." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const normalizedAddress = address.trim();

    const [{ data: me, error: meError }, { data: profiles, error: profilesError }] = await Promise.all([
      supabase.from("profiles").select(PROFILE_COLUMNS).eq("wallet_address", normalizedAddress).maybeSingle(),
      supabase.from("profiles").select(PROFILE_COLUMNS).neq("wallet_address", normalizedAddress).order("created_at", { ascending: false }),
    ]);

    if (meError || profilesError) {
      logError("Matches API query failed", { meError: meError?.code, profilesError: profilesError?.code });
      return NextResponse.json({ error: "Could not fetch matches." }, { status: 500 });
    }

    const matches = (profiles || [])
      .map((profile) => {
        const compatibility = computeCompatibility(me, profile);
        return {
          id: profile.id,
          wallet_address: profile.wallet_address,
          archetype: profile.archetype || "The Enigma",
          image: `https://api.dicebear.com/7.x/shapes/svg?seed=${profile.wallet_address || profile.id}`,
          summary: compatibility.summary,
          score: compatibility.score,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, safeLimit);

    return NextResponse.json({ success: true, matches });
  } catch {
    logError("Matches API unexpected failure");
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}

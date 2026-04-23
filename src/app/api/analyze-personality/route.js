import { NextResponse } from 'next/server';
import { logError, logInfo } from '@/lib/logger';

function normalizeAnswers(answers) {
  if (!answers || typeof answers !== "object") {
    return {};
  }
  return answers;
}

function scoreFromAnswer(value, map) {
  if (typeof value !== "string") return 50;
  return map[value] ?? 50;
}

async function callExternalAnalyzer(payload) {
  const endpoint = process.env.PERSONALITY_ANALYZER_URL;
  if (!endpoint) return null;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("External analyzer failed");
  }

  const data = await response.json();
  if (!data || typeof data !== "object") {
    throw new Error("Invalid analyzer response");
  }

  return data;
}

function buildHeuristicProfile({ onboardingAnswers }) {
  const answers = normalizeAnswers(onboardingAnswers);

  const attachment_security = scoreFromAnswer(answers.connection, {
    "Sending a private message of encouragement": 82,
    Collaborating: 76,
    "Collecting their work": 70,
    "Giving them a shoutout on X": 62,
  });

  const conflict_resolution = scoreFromAnswer(answers.philosophy, {
    "A delicate balance of both": 84,
    "Provide solace": 72,
    "Provoke discomfort": 60,
  });

  const loyalty_patience_index = scoreFromAnswer(answers.resilience, {
    "Keep creating/collecting quietly": 88,
    "Double down and build louder": 81,
    "Take a break and disconnect": 55,
  });

  const aesthetic_depth = scoreFromAnswer(answers.value, {
    "The concept behind the piece": 86,
    "The emotional process": 78,
    "The final aesthetic result": 66,
  });

  return {
    loyalty_patience_index,
    attachment_security,
    conflict_resolution,
    aesthetic_depth,
    semantic_tags: ["HeuristicProfile", answers.intention || "UnknownIntent"],
    vector_embedding: [
      loyalty_patience_index / 100,
      attachment_security / 100,
      conflict_resolution / 100,
      aesthetic_depth / 100,
    ],
    source: "heuristic",
  };
}

export async function POST(req) {
  try {
    const payload = await req.json();
    const { walletAddress, twitterHandle, onboardingAnswers } = payload;
    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json({ success: false, error: "walletAddress is required." }, { status: 400 });
    }

    const useExternal = process.env.PERSONALITY_ANALYZER_MODE === "external";
    let profileData;

    if (useExternal) {
      profileData = await callExternalAnalyzer({ walletAddress, twitterHandle, onboardingAnswers });
      logInfo("Personality profile generated via external analyzer");
    } else {
      profileData = buildHeuristicProfile({ onboardingAnswers });
      logInfo("Personality profile generated via heuristic fallback");
    }

    return NextResponse.json({
      success: true,
      message: "Personality profile generated successfully.",
      data: profileData
    });

  } catch {
    logError("Personality generation failed");
    return NextResponse.json({ success: false, error: "Failed to generate Aura." }, { status: 500 });
  }
}

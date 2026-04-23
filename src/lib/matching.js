const WEIGHTS = {
  intention: 30,
  philosophy: 20,
  resilience: 20,
  connection: 10,
  layer: 10,
  archetype: 10,
};

function normalize(value) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function getAnswer(profile, key) {
  return normalize(profile?.onboarding_answers?.[key]);
}

function pairScore(a, b, key, max) {
  if (!a || !b) return max * 0.45;
  if (a === b) return max;
  return max * 0.6;
}

export function computeCompatibility(sourceProfile, targetProfile) {
  if (!sourceProfile || !targetProfile) {
    return { score: 50, summary: "Basic compatibility signal" };
  }

  const intention = pairScore(getAnswer(sourceProfile, "intention"), getAnswer(targetProfile, "intention"), "intention", WEIGHTS.intention);
  const philosophy = pairScore(getAnswer(sourceProfile, "philosophy"), getAnswer(targetProfile, "philosophy"), "philosophy", WEIGHTS.philosophy);
  const resilience = pairScore(getAnswer(sourceProfile, "resilience"), getAnswer(targetProfile, "resilience"), "resilience", WEIGHTS.resilience);
  const connection = pairScore(getAnswer(sourceProfile, "connection"), getAnswer(targetProfile, "connection"), "connection", WEIGHTS.connection);

  const layerA = normalize(sourceProfile?.last_layer);
  const layerB = normalize(targetProfile?.last_layer);
  const layer = !layerA || !layerB ? WEIGHTS.layer * 0.5 : layerA === layerB ? WEIGHTS.layer : WEIGHTS.layer * 0.75;

  const archetypeA = normalize(sourceProfile?.archetype);
  const archetypeB = normalize(targetProfile?.archetype);
  const archetype = !archetypeA || !archetypeB ? WEIGHTS.archetype * 0.5 : archetypeA === archetypeB ? WEIGHTS.archetype : WEIGHTS.archetype * 0.7;

  const raw = intention + philosophy + resilience + connection + layer + archetype;
  const score = Math.max(30, Math.min(99, Math.round(raw)));

  let summary = "Strong vibe overlap";
  if (score < 60) summary = "Potential contrast match";
  if (score >= 75) summary = "High alignment on intentions";

  return { score, summary };
}

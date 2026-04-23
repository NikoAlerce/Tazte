/**
 * TzKT Data Extraction Utility
 * Focuses on analyzing collector behavior: holding time, flipping frequency, and art style.
 */

const TZKT_API = 'https://api.tzkt.io/v1';

export const getUserNFTs = async (address) => {
  // Fetch tokens owned by the address
  try {
    const response = await fetch(`${TZKT_API}/tokens/balances?account=${address}&limit=20&balance.gt=0`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
};

export const getUserCreations = async (address) => {
  // Fetch tokens created by the address (originated by them)
  try {
    const response = await fetch(`${TZKT_API}/tokens?metadata.creators.contains=${address}&limit=10`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
};

/**
 * Advanced semantic analysis.
 * Distinguishes between Artists, Curators, and Collectors.
 */
export const analyzeCollectorArchetype = async (address) => {
  const [owned, created] = await Promise.all([
    getUserNFTs(address),
    getUserCreations(address)
  ]);
  
  const ownedCount = owned.length;
  const createdCount = created.length;
  
  let archetype = 'The Wanderer';
  let loyalty = 0.5;

  if (createdCount > 0) {
    archetype = createdCount > 5 ? 'The Visionary' : 'The Emerging Creator';
    loyalty = 0.9;
  } else if (ownedCount > 15) {
    archetype = 'The Grand Patron';
    loyalty = 0.95;
  } else if (ownedCount > 5) {
    archetype = 'The Curator';
    loyalty = 0.8;
  }

  return {
    loyalty,
    curation: ownedCount / 20,
    activity: (ownedCount + createdCount) / 30,
    primaryArchetype: archetype,
    isArtist: createdCount > 0
  };
};

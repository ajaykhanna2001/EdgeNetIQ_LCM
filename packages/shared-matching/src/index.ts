import { Asset } from '@edgenetiq/shared-types';

export interface MatchingWeights {
  name: number;
  serialNumber: number;
  ipAddress: number;
  manufacturer: number;
  model: number;
  location: number;
  shipId: number;
}

export interface SimilarityResult {
  score: number;
  matches: {
    field: string;
    score: number;
    value1: any;
    value2: any;
  }[];
}

export interface DuplicateScore {
  asset1: Asset;
  asset2: Asset;
  similarity: SimilarityResult;
  isDuplicate: boolean;
  confidence: 'low' | 'medium' | 'high';
}

const DEFAULT_WEIGHTS: MatchingWeights = {
  name: 0.2,
  serialNumber: 0.25,
  ipAddress: 0.2,
  manufacturer: 0.1,
  model: 0.1,
  location: 0.1,
  shipId: 0.05,
};

const DUPLICATE_THRESHOLD = 0.8;
const HIGH_CONFIDENCE_THRESHOLD = 0.9;
const MEDIUM_CONFIDENCE_THRESHOLD = 0.7;

/**
 * Calculate similarity score between two strings using Jaro-Winkler distance
 */
function jaroWinklerSimilarity(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;

  const s1Lower = s1.toLowerCase();
  const s2Lower = s2.toLowerCase();
  
  if (s1Lower === s2Lower) return 1;

  // Simple implementation for demonstration
  // In production, use a proper Jaro-Winkler implementation
  const longer = s1Lower.length > s2Lower.length ? s1Lower : s2Lower;
  const shorter = s1Lower.length > s2Lower.length ? s2Lower : s1Lower;

  if (longer.length === 0) return 1;

  const editDistance = levenshteinDistance(s1Lower, s2Lower);
  const similarity = (longer.length - editDistance) / longer.length;
  
  // Apply prefix bonus (Winkler modification)
  let commonPrefix = 0;
  for (let i = 0; i < Math.min(4, shorter.length); i++) {
    if (s1Lower[i] === s2Lower[i]) {
      commonPrefix++;
    } else {
      break;
    }
  }

  return similarity + (0.1 * commonPrefix * (1 - similarity));
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(s1: string, s2: string): number {
  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));

  for (let i = 0; i <= s1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= s2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[s2.length][s1.length];
}

/**
 * Calculate exact match score (0 or 1)
 */
function exactMatch(value1: any, value2: any): number {
  if (!value1 || !value2) return 0;
  return value1 === value2 ? 1 : 0;
}

/**
 * Calculate similarity between two IP addresses
 */
function ipSimilarity(ip1: string, ip2: string): number {
  if (!ip1 || !ip2) return 0;
  if (ip1 === ip2) return 1;

  // Simple subnet similarity - same network gets partial score
  const parts1 = ip1.split('.');
  const parts2 = ip2.split('.');

  if (parts1.length !== 4 || parts2.length !== 4) return 0;

  let matchingParts = 0;
  for (let i = 0; i < 4; i++) {
    if (parts1[i] === parts2[i]) {
      matchingParts++;
    } else {
      break; // Stop at first mismatch for network similarity
    }
  }

  // Give partial credit for same network/subnet
  return matchingParts / 4;
}

/**
 * Calculate weighted similarity between two assets
 */
export function calculateAssetSimilarity(
  asset1: Asset,
  asset2: Asset,
  weights: Partial<MatchingWeights> = {}
): SimilarityResult {
  const finalWeights = { ...DEFAULT_WEIGHTS, ...weights };
  const matches: SimilarityResult['matches'] = [];
  let totalScore = 0;
  let totalWeight = 0;

  // Name similarity
  if (asset1.name && asset2.name) {
    const score = jaroWinklerSimilarity(asset1.name, asset2.name);
    matches.push({
      field: 'name',
      score,
      value1: asset1.name,
      value2: asset2.name,
    });
    totalScore += score * finalWeights.name;
    totalWeight += finalWeights.name;
  }

  // Serial number exact match
  if (asset1.serialNumber && asset2.serialNumber) {
    const score = exactMatch(asset1.serialNumber, asset2.serialNumber);
    matches.push({
      field: 'serialNumber',
      score,
      value1: asset1.serialNumber,
      value2: asset2.serialNumber,
    });
    totalScore += score * finalWeights.serialNumber;
    totalWeight += finalWeights.serialNumber;
  }

  // IP address similarity
  if (asset1.ipAddress && asset2.ipAddress) {
    const score = ipSimilarity(asset1.ipAddress, asset2.ipAddress);
    matches.push({
      field: 'ipAddress',
      score,
      value1: asset1.ipAddress,
      value2: asset2.ipAddress,
    });
    totalScore += score * finalWeights.ipAddress;
    totalWeight += finalWeights.ipAddress;
  }

  // Manufacturer similarity
  if (asset1.manufacturer && asset2.manufacturer) {
    const score = jaroWinklerSimilarity(asset1.manufacturer, asset2.manufacturer);
    matches.push({
      field: 'manufacturer',
      score,
      value1: asset1.manufacturer,
      value2: asset2.manufacturer,
    });
    totalScore += score * finalWeights.manufacturer;
    totalWeight += finalWeights.manufacturer;
  }

  // Model similarity
  if (asset1.model && asset2.model) {
    const score = jaroWinklerSimilarity(asset1.model, asset2.model);
    matches.push({
      field: 'model',
      score,
      value1: asset1.model,
      value2: asset2.model,
    });
    totalScore += score * finalWeights.model;
    totalWeight += finalWeights.model;
  }

  // Location similarity
  if (asset1.location && asset2.location) {
    const score = jaroWinklerSimilarity(asset1.location, asset2.location);
    matches.push({
      field: 'location',
      score,
      value1: asset1.location,
      value2: asset2.location,
    });
    totalScore += score * finalWeights.location;
    totalWeight += finalWeights.location;
  }

  // Ship ID exact match
  const shipScore = exactMatch(asset1.shipId, asset2.shipId);
  matches.push({
    field: 'shipId',
    score: shipScore,
    value1: asset1.shipId,
    value2: asset2.shipId,
  });
  totalScore += shipScore * finalWeights.shipId;
  totalWeight += finalWeights.shipId;

  // Normalize score
  const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;

  return {
    score: normalizedScore,
    matches,
  };
}

/**
 * Determine if two assets are duplicates based on similarity score
 */
export function calculateDuplicateScore(
  asset1: Asset,
  asset2: Asset,
  weights: Partial<MatchingWeights> = {},
  threshold: number = DUPLICATE_THRESHOLD
): DuplicateScore {
  const similarity = calculateAssetSimilarity(asset1, asset2, weights);
  const isDuplicate = similarity.score >= threshold;

  let confidence: 'low' | 'medium' | 'high';
  if (similarity.score >= HIGH_CONFIDENCE_THRESHOLD) {
    confidence = 'high';
  } else if (similarity.score >= MEDIUM_CONFIDENCE_THRESHOLD) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    asset1,
    asset2,
    similarity,
    isDuplicate,
    confidence,
  };
}

/**
 * Find potential duplicates in a list of assets
 */
export function findPotentialDuplicates(
  assets: Asset[],
  weights: Partial<MatchingWeights> = {},
  threshold: number = DUPLICATE_THRESHOLD
): DuplicateScore[] {
  const duplicates: DuplicateScore[] = [];

  for (let i = 0; i < assets.length; i++) {
    for (let j = i + 1; j < assets.length; j++) {
      const duplicateScore = calculateDuplicateScore(assets[i], assets[j], weights, threshold);
      if (duplicateScore.isDuplicate) {
        duplicates.push(duplicateScore);
      }
    }
  }

  // Sort by similarity score (highest first)
  return duplicates.sort((a, b) => b.similarity.score - a.similarity.score);
}

/**
 * Group assets by similarity clusters
 */
export function groupAssetsBySimilarity(
  assets: Asset[],
  weights: Partial<MatchingWeights> = {},
  threshold: number = DUPLICATE_THRESHOLD
): Asset[][] {
  const groups: Asset[][] = [];
  const processed = new Set<string>();

  for (const asset of assets) {
    if (processed.has(asset.id)) continue;

    const group = [asset];
    processed.add(asset.id);

    // Find all similar assets
    for (const otherAsset of assets) {
      if (processed.has(otherAsset.id)) continue;

      const similarity = calculateAssetSimilarity(asset, otherAsset, weights);
      if (similarity.score >= threshold) {
        group.push(otherAsset);
        processed.add(otherAsset.id);
      }
    }

    groups.push(group);
  }

  return groups;
}

/**
 * Merge duplicate assets (keep the first one, mark others for deletion)
 */
export function mergeDuplicateAssets(duplicates: DuplicateScore[]): {
  toKeep: Asset[];
  toDelete: Asset[];
  mergeActions: Array<{
    primary: Asset;
    duplicates: Asset[];
    confidence: 'low' | 'medium' | 'high';
  }>;
} {
  const toKeep: Asset[] = [];
  const toDelete: Asset[] = [];
  const mergeActions: Array<{
    primary: Asset;
    duplicates: Asset[];
    confidence: 'low' | 'medium' | 'high';
  }> = [];
  
  const processed = new Set<string>();

  for (const duplicate of duplicates) {
    if (processed.has(duplicate.asset1.id) || processed.has(duplicate.asset2.id)) {
      continue;
    }

    // Choose the primary asset (prefer one with more complete data)
    const primary = choosePreferredAsset(duplicate.asset1, duplicate.asset2);
    const secondary = primary.id === duplicate.asset1.id ? duplicate.asset2 : duplicate.asset1;

    toKeep.push(primary);
    toDelete.push(secondary);
    
    mergeActions.push({
      primary,
      duplicates: [secondary],
      confidence: duplicate.confidence,
    });

    processed.add(duplicate.asset1.id);
    processed.add(duplicate.asset2.id);
  }

  return { toKeep, toDelete, mergeActions };
}

/**
 * Choose the preferred asset from two similar assets
 */
function choosePreferredAsset(asset1: Asset, asset2: Asset): Asset {
  // Prefer asset with more complete information
  const score1 = calculateCompletenessScore(asset1);
  const score2 = calculateCompletenessScore(asset2);

  if (score1 > score2) return asset1;
  if (score2 > score1) return asset2;

  // If equal completeness, prefer the newer one
  return asset1.updatedAt > asset2.updatedAt ? asset1 : asset2;
}

/**
 * Calculate completeness score for an asset
 */
function calculateCompletenessScore(asset: Asset): number {
  let score = 0;
  const fields = ['manufacturer', 'model', 'serialNumber', 'ipAddress', 'location'];
  
  for (const field of fields) {
    if ((asset as any)[field]) score++;
  }
  
  score += asset.tags.length * 0.1; // Small bonus for tags
  
  return score;
}

export {
  DEFAULT_WEIGHTS,
  DUPLICATE_THRESHOLD,
  HIGH_CONFIDENCE_THRESHOLD,
  MEDIUM_CONFIDENCE_THRESHOLD,
};
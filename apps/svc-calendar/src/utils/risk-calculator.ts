import { RiskFactors, RiskWeights, RiskScore } from '@edgenetiq/shared-types';
import { getRiskWeights } from '@edgenetiq/shared-config';

/**
 * Calculate risk score for an event or asset
 * Formula: risk = w1*(1/(days_to_eosl+1)) + w2*criticality + w3*compliance_gap + w4*spares_backlog + w5*connectivity_penalty
 */
export function calculateRiskScore(factors: RiskFactors, customWeights?: Partial<RiskWeights>): number {
  const weights = { ...getRiskWeights(), ...customWeights };

  const components = {
    eosl: factors.daysToEosl !== undefined ? weights.eoslWeight * (1 / (factors.daysToEosl + 1)) : 0,
    criticality: weights.criticalityWeight * getCriticalityScore(factors.criticality),
    compliance: weights.complianceWeight * factors.complianceGap,
    spares: weights.sparesWeight * Math.min(factors.sparesBacklog / 10, 1), // Normalize to 0-1
    connectivity: weights.connectivityWeight * factors.connectivityPenalty,
  };

  const overall = Object.values(components).reduce((sum, score) => sum + score, 0);

  return Math.min(Math.max(overall, 0), 1); // Clamp to 0-1 range
}

/**
 * Calculate detailed risk score with components breakdown
 */
export function calculateDetailedRiskScore(factors: RiskFactors, customWeights?: Partial<RiskWeights>): RiskScore {
  const weights = { ...getRiskWeights(), ...customWeights };

  const components = {
    eosl: factors.daysToEosl !== undefined ? weights.eoslWeight * (1 / (factors.daysToEosl + 1)) : 0,
    criticality: weights.criticalityWeight * getCriticalityScore(factors.criticality),
    compliance: weights.complianceWeight * factors.complianceGap,
    spares: weights.sparesWeight * Math.min(factors.sparesBacklog / 10, 1),
    connectivity: weights.connectivityWeight * factors.connectivityPenalty,
  };

  const overall = Object.values(components).reduce((sum, score) => sum + score, 0);

  return {
    overall: Math.min(Math.max(overall, 0), 1),
    factors,
    weights,
    components,
  };
}

/**
 * Convert criticality level to numeric score
 */
function getCriticalityScore(criticality: 'low' | 'medium' | 'high' | 'critical'): number {
  const criticalityMap = {
    low: 0.25,
    medium: 0.5,
    high: 0.75,
    critical: 1.0,
  };

  return criticalityMap[criticality] || 0.5;
}

/**
 * Get risk level based on score
 */
export function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 0.8) return 'critical';
  if (score >= 0.6) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

/**
 * Check if risk score has changed significantly
 */
export function hasSignificantRiskChange(oldScore: number, newScore: number, threshold = 0.1): boolean {
  return Math.abs(newScore - oldScore) >= threshold;
}
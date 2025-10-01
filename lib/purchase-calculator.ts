/**
 * Purchase Decision Calculator - ADHD-Optimized
 * Helps reduce impulsive purchases by emphasizing deliberation over instant gratification
 */

import pluralize from "pluralize"

export interface PurchaseMetrics {
  productName: string
  price: number
  monthlyIncome: number
  discountPercentage: number

  // Core value metrics
  utilityScore: number // 0-10: How much will this improve daily life?
  necessityScore: number // 0-10: Is this a want or need?
  longTermValue: number // 0-10: Will this provide value for months/years?
  useFrequency: number // 0-10: How often will you actually use this?

  // Anti-impulsivity metrics (CRITICAL for ADHD)
  waitingDays: number // Days since first wanting this
  researchDepth: number // 0-10: How much research have you done?
  impulseResistance: number // 0-10: How deliberate does this feel? (0=very impulsive, 10=very planned)
  hasUnusedSimilar: boolean // Have I bought similar items that went unused?

  // Optional: For replacements
  isReplacement: boolean
  upgradeJustification: number // 0-10: How much better than what you have?
}

/**
 * Impact multipliers - ADHD-optimized weights
 * Higher weight = more influence on final score
 */
export const IMPACT_MULTIPLIERS = {
  // Financial responsibility
  affordability: 1.3,

  // Core value (high impact)
  utility: 1.6,
  necessity: 1.8,
  longTermValue: 1.5,
  useFrequency: 1.4,

  // Anti-impulsivity (CRITICAL - highest weights)
  waitingPeriod: 2.0, // Most important for ADHD
  researchDepth: 1.7,
  impulseResistance: 1.9,
  unusedSimilarPenalty: 1.5, // Heavy penalty for past unused purchases

  // Lower priority
  discount: 0.4, // LOW - discounts trigger impulsivity!
  upgrade: 0.8,
}

/**
 * Calculates affordability score (0-10)
 */
export function calculateAffordability(
  price: number,
  monthlyIncome: number,
): number {
  if (monthlyIncome <= 0) return 0

  const priceRatio = price / monthlyIncome

  // Score based on percentage of monthly income
  if (priceRatio <= 0.01) return 10 // Less than 1%
  if (priceRatio <= 0.05) return 9 // 1-5%
  if (priceRatio <= 0.1) return 7 // 5-10%
  if (priceRatio <= 0.2) return 5 // 10-20%
  if (priceRatio <= 0.3) return 3 // 20-30%
  if (priceRatio <= 0.5) return 1 // 30-50%
  return 0
}

/**
 * Calculates waiting period score (0-10)
 * CRITICAL for ADHD: Longer wait = clearer mind
 */
export function calculateWaitingScore(days: number): number {
  if (days === 0) return 0 // Same day = maximum impulsivity
  if (days === 1) return 3 // Next day is better but still impulsive
  if (days <= 3) return 5 // 2-3 days
  if (days <= 7) return 7 // A week is good
  if (days <= 14) return 9 // Two weeks is excellent
  return 10 // 2+ weeks = maximum deliberation
}

/**
 * Calculates discount impact (0-10)
 * Note: For ADHD users, discounts can trigger impulsivity
 * This is weighted lower than other factors
 */
export function calculateDiscountBenefit(discountPercentage: number): number {
  return Math.min(10, (discountPercentage / 50) * 10)
}

/**
 * Penalty for impulsive feelings
 * Returns 0-10 where 10 is best (most deliberate)
 */
export function calculateImpulseControl(impulseResistance: number): number {
  return impulseResistance // Direct score: higher = more deliberate
}

/**
 * Calculates final purchase decision score (0-100)
 * ADHD-optimized to heavily penalize impulsive purchases
 */
export function calculatePurchaseScore(metrics: PurchaseMetrics): number {
  const {
    price,
    monthlyIncome,
    discountPercentage,
    utilityScore,
    necessityScore,
    longTermValue,
    useFrequency,
    waitingDays,
    researchDepth,
    impulseResistance,
    hasUnusedSimilar,
    isReplacement,
    upgradeJustification,
  } = metrics

  // Calculate individual components
  const affordabilityScore = calculateAffordability(price, monthlyIncome)
  const waitingScore = calculateWaitingScore(waitingDays)
  const discountBenefit = calculateDiscountBenefit(discountPercentage)
  const impulseControlScore = calculateImpulseControl(impulseResistance)

  // Apply impact multipliers
  const weightedAffordability =
    affordabilityScore * IMPACT_MULTIPLIERS.affordability
  const weightedUtility = utilityScore * IMPACT_MULTIPLIERS.utility
  const weightedNecessity = necessityScore * IMPACT_MULTIPLIERS.necessity
  const weightedLongTermValue = longTermValue * IMPACT_MULTIPLIERS.longTermValue
  const weightedUseFrequency = useFrequency * IMPACT_MULTIPLIERS.useFrequency
  const weightedWaiting = waitingScore * IMPACT_MULTIPLIERS.waitingPeriod
  const weightedResearch = researchDepth * IMPACT_MULTIPLIERS.researchDepth
  const weightedImpulseControl =
    impulseControlScore * IMPACT_MULTIPLIERS.impulseResistance
  const weightedDiscount = discountBenefit * IMPACT_MULTIPLIERS.discount

  // Upgrade justification only counts if it's a replacement
  const weightedUpgrade = isReplacement
    ? upgradeJustification * IMPACT_MULTIPLIERS.upgrade
    : 0

  // Heavy penalty if you have unused similar items (applies negative score)
  const unusedSimilarPenalty = hasUnusedSimilar
    ? -10 * IMPACT_MULTIPLIERS.unusedSimilarPenalty
    : 0

  // Calculate total weighted score
  const totalWeightedScore =
    weightedAffordability +
    weightedUtility +
    weightedNecessity +
    weightedLongTermValue +
    weightedUseFrequency +
    weightedWaiting +
    weightedResearch +
    weightedImpulseControl +
    weightedDiscount +
    weightedUpgrade +
    unusedSimilarPenalty

  // Calculate maximum possible score
  const maxPossibleScore =
    10 * IMPACT_MULTIPLIERS.affordability +
    10 * IMPACT_MULTIPLIERS.utility +
    10 * IMPACT_MULTIPLIERS.necessity +
    10 * IMPACT_MULTIPLIERS.longTermValue +
    10 * IMPACT_MULTIPLIERS.useFrequency +
    10 * IMPACT_MULTIPLIERS.waitingPeriod +
    10 * IMPACT_MULTIPLIERS.researchDepth +
    10 * IMPACT_MULTIPLIERS.impulseResistance +
    10 * IMPACT_MULTIPLIERS.discount +
    (isReplacement ? 10 * IMPACT_MULTIPLIERS.upgrade : 0)

  // Normalize to 0-100 scale
  const normalizedScore = (totalWeightedScore / maxPossibleScore) * 100

  return Math.round(Math.min(100, Math.max(0, normalizedScore)))
}

/**
 * Gets a recommendation based on score
 * Thresholds adjusted for ADHD protection
 */
export function getRecommendation(score: number): {
  text: string
  variant: "default" | "secondary" | "destructive" | "outline"
  colorClass: string
} {
  // Stricter thresholds for ADHD users
  if (score >= 80) {
    return {
      text: "Go for it!",
      variant: "default",
      colorClass: "text-success",
    }
  }
  if (score >= 65) {
    return {
      text: "Probably Worth It",
      variant: "secondary",
      colorClass: "text-info",
    }
  }
  if (score >= 45) {
    return {
      text: "Wait & Think More",
      variant: "outline",
      colorClass: "text-warning",
    }
  }
  return {
    text: "Walk Away",
    variant: "destructive",
    colorClass: "text-danger",
  }
}

export interface Advice {
  kind: "success" | "warning" | "danger"
  emoji: string
  text: string
}

/**
 * Gets helpful advice based on the metrics
 */
export function getAdvice(metrics: PurchaseMetrics, score: number): Advice[] {
  const advice: Advice[] = []

  // Waiting period advice
  if (metrics.waitingDays === 0) {
    advice.push({
      kind: "danger",
      emoji: "🚨",
      text: "You just thought of this! Wait at least 24 hours before buying.",
    })
  } else if (metrics.waitingDays < 3) {
    advice.push({
      kind: "warning",
      emoji: "⏰",
      text: `You've only waited ${metrics.waitingDays} ${pluralize("day", metrics.waitingDays)}. Try waiting a full week.`,
    })
  } else if (metrics.waitingDays >= 7) {
    advice.push({
      kind: "success",
      emoji: "✅",
      text: `Great job waiting ${metrics.waitingDays} days! Your mind is clearer now.`,
    })
  }

  // Research advice
  if (metrics.researchDepth < 4) {
    advice.push({
      kind: "warning",
      emoji: "📚",
      text: "Do more research! Read reviews, compare alternatives, watch videos.",
    })
  } else if (metrics.researchDepth >= 7) {
    advice.push({
      kind: "success",
      emoji: "✅",
      text: "Good research! You've done your homework.",
    })
  }

  // Impulse control
  if (metrics.impulseResistance < 4) {
    advice.push({
      kind: "danger",
      emoji: "⚠️",
      text: "This feels very impulsive. That's a red flag for ADHD purchases.",
    })
  } else if (metrics.impulseResistance >= 7) {
    advice.push({
      kind: "success",
      emoji: "✅",
      text: "This is a deliberate, planned decision. Good sign!",
    })
  }

  // Necessity check
  if (metrics.necessityScore < 5 && score < 60) {
    advice.push({
      kind: "warning",
      emoji: "💭",
      text: "This is more of a want than a need. Are you okay with that?",
    })
  }

  // Affordability warning
  const priceRatio = metrics.price / metrics.monthlyIncome
  if (priceRatio > 0.2) {
    advice.push({
      kind: "danger",
      emoji: "💰",
      text: "This costs over 20% of your monthly income. That's significant!",
    })
  }

  // Discount trap warning
  if (metrics.discountPercentage > 30 && metrics.waitingDays < 2) {
    advice.push({
      kind: "danger",
      emoji: "🎣",
      text: "Big discount + quick decision = common ADHD impulse trap. Wait!",
    })
  }

  // Use frequency
  if (metrics.useFrequency < 5) {
    advice.push({
      kind: "warning",
      emoji: "🤔",
      text: "You won't use this often. Will it collect dust?",
    })
  }

  // Unused similar items warning
  if (metrics.hasUnusedSimilar) {
    advice.push({
      kind: "danger",
      emoji: "🚨",
      text: "You have unused similar purchases! History suggests this may go unused too.",
    })
  }

  return advice
}

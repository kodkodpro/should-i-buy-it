/**
 * Purchase Decision Calculator
 * Calculates a 0-100 score to help decide whether to buy a product
 */

export interface PurchaseMetrics {
  productName: string
  price: number
  monthlyIncome: number
  discountPercentage: number
  utilityScore: number // 0-10
  instantHappinessScore: number // 0-10
  sustainabilityScore: number // 0-10
  upgradeJustification: number // 0-10
  necessityScore: number // 0-10
}

/**
 * Impact multipliers for each metric
 * These can be tweaked to adjust the importance of each factor
 */
export const IMPACT_MULTIPLIERS = {
  affordability: 1.2, // Higher = price matters more
  discount: 0.8, // Higher = discounts matter more
  utility: 1.5, // Higher = daily life improvement matters more
  instantHappiness: 0.6, // Higher = immediate joy matters more
  sustainability: 1.3, // Higher = long-term happiness matters more
  upgrade: 0.7, // Higher = upgrade justification matters more
  necessity: 1.4, // Higher = necessity matters more
}

/**
 * Calculates affordability score (0-10)
 * Lower price relative to income = higher score
 */
export function calculateAffordability(
  price: number,
  monthlyIncome: number,
): number {
  if (monthlyIncome <= 0) return 0
  
  const priceRatio = price / monthlyIncome
  
  // Score based on percentage of monthly income
  if (priceRatio <= 0.01) return 10 // Less than 1% of income
  if (priceRatio <= 0.05) return 9 // 1-5%
  if (priceRatio <= 0.10) return 7 // 5-10%
  if (priceRatio <= 0.20) return 5 // 10-20%
  if (priceRatio <= 0.30) return 3 // 20-30%
  if (priceRatio <= 0.50) return 1 // 30-50%
  return 0 // More than 50%
}

/**
 * Calculates discount benefit score (0-10)
 */
export function calculateDiscountBenefit(discountPercentage: number): number {
  // Linear scaling: 50% discount = 10 points
  return Math.min(10, (discountPercentage / 50) * 10)
}

/**
 * Calculates value score based on utility and sustainability
 */
export function calculateValueScore(
  utilityScore: number,
  sustainabilityScore: number,
): number {
  // Average of utility and sustainability, weighted toward sustainability
  return (utilityScore * 0.4 + sustainabilityScore * 0.6)
}

/**
 * Calculates emotional benefit score
 */
export function calculateEmotionalBenefit(
  instantHappinessScore: number,
  sustainabilityScore: number,
): number {
  // Instant happiness weighted by how long it lasts
  return (instantHappinessScore * sustainabilityScore) / 10
}

/**
 * Calculates final purchase decision score (0-100)
 */
export function calculatePurchaseScore(metrics: PurchaseMetrics): number {
  const {
    price,
    monthlyIncome,
    discountPercentage,
    utilityScore,
    instantHappinessScore,
    sustainabilityScore,
    upgradeJustification,
    necessityScore,
  } = metrics

  // Calculate individual components
  const affordabilityScore = calculateAffordability(price, monthlyIncome)
  const discountBenefit = calculateDiscountBenefit(discountPercentage)

  // Apply impact multipliers and normalize
  const weightedAffordability = affordabilityScore * IMPACT_MULTIPLIERS.affordability
  const weightedDiscount = discountBenefit * IMPACT_MULTIPLIERS.discount
  const weightedUtility = utilityScore * IMPACT_MULTIPLIERS.utility
  const weightedInstantHappiness = instantHappinessScore * IMPACT_MULTIPLIERS.instantHappiness
  const weightedSustainability = sustainabilityScore * IMPACT_MULTIPLIERS.sustainability
  const weightedUpgrade = upgradeJustification * IMPACT_MULTIPLIERS.upgrade
  const weightedNecessity = necessityScore * IMPACT_MULTIPLIERS.necessity

  // Calculate total weighted score
  const totalWeightedScore =
    weightedAffordability +
    weightedDiscount +
    weightedUtility +
    weightedInstantHappiness +
    weightedSustainability +
    weightedUpgrade +
    weightedNecessity

  // Calculate maximum possible score
  const maxPossibleScore =
    10 * IMPACT_MULTIPLIERS.affordability +
    10 * IMPACT_MULTIPLIERS.discount +
    10 * IMPACT_MULTIPLIERS.utility +
    10 * IMPACT_MULTIPLIERS.instantHappiness +
    10 * IMPACT_MULTIPLIERS.sustainability +
    10 * IMPACT_MULTIPLIERS.upgrade +
    10 * IMPACT_MULTIPLIERS.necessity

  // Normalize to 0-100 scale
  const normalizedScore = (totalWeightedScore / maxPossibleScore) * 100

  return Math.round(Math.min(100, Math.max(0, normalizedScore)))
}

/**
 * Gets a recommendation text based on the score
 */
export function getRecommendation(score: number): {
  text: string
  variant: "default" | "secondary" | "destructive" | "outline"
  colorClass: string
} {
  if (score >= 75) {
    return {
      text: "Go for it!",
      variant: "default",
      colorClass: "text-success",
    }
  }
  if (score >= 60) {
    return {
      text: "Worth Considering",
      variant: "secondary",
      colorClass: "text-info",
    }
  }
  if (score >= 40) {
    return {
      text: "Think It Over",
      variant: "outline",
      colorClass: "text-warning",
    }
  }
  return {
    text: "Skip This One",
    variant: "destructive",
    colorClass: "text-danger",
  }
}


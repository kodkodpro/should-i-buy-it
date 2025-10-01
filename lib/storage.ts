import type { PurchaseMetrics } from "./purchase-calculator"

export interface SavedCalculation {
  id: string
  timestamp: number
  metrics: PurchaseMetrics
  score: number
}

const STORAGE_KEY = "should-i-buy-it-calculations"

export function getSavedCalculations(): SavedCalculation[] {
  if (typeof window === "undefined") return []
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    return JSON.parse(saved)
  } catch (e) {
    console.error("Failed to load saved calculations", e)
    return []
  }
}

export function saveCalculation(
  metrics: PurchaseMetrics,
  score: number,
  id?: string
): SavedCalculation {
  const calculations = getSavedCalculations()
  
  const calculation: SavedCalculation = {
    id: id || crypto.randomUUID(),
    timestamp: Date.now(),
    metrics,
    score,
  }
  
  // Update existing or add new
  const existingIndex = calculations.findIndex((c) => c.id === calculation.id)
  if (existingIndex >= 0) {
    calculations[existingIndex] = calculation
  } else {
    calculations.unshift(calculation)
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(calculations))
  return calculation
}

export function deleteCalculation(id: string): void {
  const calculations = getSavedCalculations()
  const filtered = calculations.filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

export function getCalculationById(id: string): SavedCalculation | undefined {
  const calculations = getSavedCalculations()
  return calculations.find((c) => c.id === id)
}


"use client"

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import { toast } from "sonner"
import {
  calculatePurchaseScore,
  getRecommendation,
  type PurchaseMetrics,
} from "@/lib/purchase-calculator"
import {
  deleteCalculation,
  getCalculationById,
  saveCalculation,
} from "@/lib/storage"

const FREE_MONTHLY_MONEY_KEY = "free-monthly-money"

// Load saved free monthly money from localStorage
function getSavedFreeMonthlyMoney(): number {
  if (typeof window === "undefined") return 0
  const saved = localStorage.getItem(FREE_MONTHLY_MONEY_KEY)
  return saved ? parseFloat(saved) : 0
}

// Save free monthly money to localStorage
function saveFreeMonthlyMoney(amount: number) {
  if (typeof window === "undefined") return
  localStorage.setItem(FREE_MONTHLY_MONEY_KEY, amount.toString())
}

const getInitialMetrics = (): PurchaseMetrics => ({
  productName: "",
  price: 0,
  freeMonthlyMoney: getSavedFreeMonthlyMoney(),
  discountPercentage: 0,

  // Core value metrics
  utilityScore: 5,
  necessityScore: 5,
  longTermValue: 5,
  useFrequency: 5,

  // Anti-impulsivity metrics
  waitingDays: 0,
  researchDepth: 5,
  impulseResistance: 5,
  hasUnusedSimilar: false,

  // Replacement metrics
  isReplacement: false,
  upgradeJustification: 5,
})

// Custom event to notify sidebar of storage changes
function notifyStorageChange() {
  window.dispatchEvent(new Event("storage-updated"))
}

interface CalculationContextType {
  currentId: string | undefined
  setCurrentId: (id: string | undefined) => void
  metrics: PurchaseMetrics
  updateMetric: <K extends keyof PurchaseMetrics>(
    key: K,
    value: PurchaseMetrics[K],
  ) => void
  score: number
  recommendation: ReturnType<typeof getRecommendation>
  handleSave: () => void
  handleReset: () => void
  handleDelete: () => void
}

const CalculationContext = createContext<CalculationContextType | undefined>(
  undefined,
)

export function CalculationProvider({ children }: { children: ReactNode }) {
  const [currentId, setCurrentId] = useState<string | undefined>(undefined)
  const [metrics, setMetrics] = useState<PurchaseMetrics>(getInitialMetrics())
  const [score, setScore] = useState(0)
  const [recommendation, setRecommendation] = useState(getRecommendation(0))

  // Load calculation when currentId changes
  useEffect(() => {
    if (currentId) {
      const calculation = getCalculationById(currentId)
      if (calculation) {
        setMetrics(calculation.metrics)
      }
    } else {
      // Start new calculation but preserve freeMonthlyMoney
      setMetrics(getInitialMetrics())
    }
  }, [currentId])

  // Save freeMonthlyMoney to localStorage whenever it changes
  useEffect(() => {
    if (metrics.freeMonthlyMoney > 0) {
      saveFreeMonthlyMoney(metrics.freeMonthlyMoney)
    }
  }, [metrics.freeMonthlyMoney])

  // Recalculate score when metrics change
  useEffect(() => {
    const newScore = calculatePurchaseScore(metrics)
    setScore(newScore)
    setRecommendation(getRecommendation(newScore))
  }, [metrics])

  const updateMetric = <K extends keyof PurchaseMetrics>(
    key: K,
    value: PurchaseMetrics[K],
  ) => {
    setMetrics((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    const saved = saveCalculation(metrics, score, currentId)
    setCurrentId(saved.id)
    notifyStorageChange()
    toast.success(currentId ? "Calculation updated!" : "Calculation saved!", {
      description: metrics.productName || "Unnamed product",
    })
  }

  const handleDelete = () => {
    if (!currentId) return

    if (confirm("Are you sure you want to delete this calculation?")) {
      const productName = metrics.productName || "Unnamed product"
      deleteCalculation(currentId)
      notifyStorageChange()
      setCurrentId(undefined)
      toast.success("Calculation deleted", {
        description: productName,
      })
    }
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all fields?")) {
      // Reset but preserve freeMonthlyMoney
      setMetrics(getInitialMetrics())
      toast.info("Form reset", {
        description: "All fields have been reset to default values",
      })
    }
  }

  return (
    <CalculationContext.Provider
      value={{
        currentId,
        setCurrentId,
        metrics,
        updateMetric,
        score,
        recommendation,
        handleSave,
        handleReset,
        handleDelete,
      }}
    >
      {children}
    </CalculationContext.Provider>
  )
}

export function useCalculation() {
  const context = useContext(CalculationContext)
  if (context === undefined) {
    throw new Error("useCalculation must be used within CalculationProvider")
  }
  return context
}

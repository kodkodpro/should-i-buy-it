"use client"

import { createContext, type ReactNode, useContext, useState } from "react"

interface CalculationContextType {
  currentId: string | undefined
  setCurrentId: (id: string | undefined) => void
}

const CalculationContext = createContext<CalculationContextType | undefined>(
  undefined,
)

export function CalculationProvider({ children }: { children: ReactNode }) {
  const [currentId, setCurrentId] = useState<string | undefined>(undefined)

  return (
    <CalculationContext.Provider value={{ currentId, setCurrentId }}>
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

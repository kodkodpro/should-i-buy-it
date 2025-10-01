"use client"

import { Plus, ShoppingCart } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useCalculation } from "@/lib/calculation-context"
import { getRecommendation } from "@/lib/purchase-calculator"
import { getSavedCalculations, type SavedCalculation } from "@/lib/storage"

export function AppSidebar() {
  const { currentId, setCurrentId } = useCalculation()
  const [calculations, setCalculations] = useState<SavedCalculation[]>([])

  const loadCalculations = () => {
    setCalculations(getSavedCalculations())
  }

  useEffect(() => {
    loadCalculations()

    const handleStorageChange = () => {
      loadCalculations()
    }

    window.addEventListener("storage-updated", handleStorageChange)
    return () =>
      window.removeEventListener("storage-updated", handleStorageChange)
  }, [])

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    if (days === 1) {
      return "Yesterday"
    }
    if (days < 7) {
      return `${days} days ago`
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Button
          onClick={() => setCurrentId(undefined)}
          className="w-full justify-start"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Calculation
        </Button>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Saved Calculations</SidebarGroupLabel>
          <SidebarGroupContent>
            {calculations.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No saved calculations yet
              </div>
            ) : (
              <SidebarMenu>
                {calculations.map((calc) => {
                  const recommendation = getRecommendation(calc.score)
                  const isActive = calc.id === currentId

                  return (
                    <SidebarMenuItem key={calc.id}>
                      <SidebarMenuButton
                        onClick={() => setCurrentId(calc.id)}
                        isActive={isActive}
                        className="flex flex-col items-start gap-1 h-auto py-3"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <ShoppingCart className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium truncate flex-1 text-left">
                            {calc.metrics.productName || "Unnamed Product"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between w-full gap-2 text-xs">
                          <span className="text-muted-foreground">
                            {formatDate(calc.timestamp)}
                          </span>
                          <Badge
                            variant={recommendation.variant}
                            className="text-xs px-2 py-0"
                          >
                            {calc.score}
                          </Badge>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 text-xs text-muted-foreground text-center">
        {calculations.length} saved calculation
        {calculations.length !== 1 ? "s" : ""}
      </SidebarFooter>
    </Sidebar>
  )
}

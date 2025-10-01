"use client"

import { Plus, RotateCcw, Save, ShoppingCart, Trash2 } from "lucide-react"
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
  const { currentId, setCurrentId, handleSave, handleReset, handleDelete } =
    useCalculation()
  const [calculations, setCalculations] = useState<SavedCalculation[]>([])

  useEffect(() => {
    const loadCalculations = () => {
      setCalculations(getSavedCalculations())
    }

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
      <Separator />
      <SidebarFooter className="p-4 space-y-2">
        <Button onClick={handleSave} size="sm" className="w-full">
          <Save className="mr-2 h-4 w-4" />
          {currentId ? "Update" : "Save"} Calculation
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="flex-1 shadow-none"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          {currentId && (
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
              className="flex-1"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
        <div className="text-xs text-muted-foreground text-center pt-2">
          {calculations.length} saved calculation
          {calculations.length !== 1 ? "s" : ""}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

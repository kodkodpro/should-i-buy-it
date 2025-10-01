"use client"

import { Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useCalculation } from "@/lib/calculation-context"
import { H1, H3, Lead, Muted } from "@/lib/components/ui/typography"
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

const initialMetrics: PurchaseMetrics = {
  productName: "",
  price: 0,
  monthlyIncome: 0,
  discountPercentage: 0,
  utilityScore: 5,
  instantHappinessScore: 5,
  sustainabilityScore: 5,
  upgradeJustification: 5,
  necessityScore: 5,
}

// Custom event to notify sidebar of storage changes
function notifyStorageChange() {
  window.dispatchEvent(new Event("storage-updated"))
}

export default function Home() {
  const { currentId, setCurrentId } = useCalculation()
  const [metrics, setMetrics] = useState<PurchaseMetrics>(initialMetrics)
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
      setMetrics(initialMetrics)
    }
  }, [currentId])

  // Recalculate score when metrics change
  useEffect(() => {
    const newScore = calculatePurchaseScore(metrics)
    setScore(newScore)
    setRecommendation(getRecommendation(newScore))
  }, [metrics])

  const handleSave = () => {
    const saved = saveCalculation(metrics, score, currentId)
    setCurrentId(saved.id)
    notifyStorageChange()
    alert("Calculation saved!")
  }

  const handleDelete = () => {
    if (!currentId) return

    if (confirm("Are you sure you want to delete this calculation?")) {
      deleteCalculation(currentId)
      notifyStorageChange()
      setCurrentId(undefined)
    }
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all fields?")) {
      setMetrics(initialMetrics)
      if (!currentId) {
        // Only reset the form, don't delete from storage
        return
      }
    }
  }

  const updateMetric = <K extends keyof PurchaseMetrics>(
    key: K,
    value: PurchaseMetrics[K],
  ) => {
    setMetrics((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen p-4 md:p-8 w-full">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <H1 className="mb-2">Should I Buy It?</H1>
          <Lead>
            Make smarter purchase decisions based on value, cost and your
            financial context
          </Lead>
        </header>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., New Gaming Console"
                    value={metrics.productName}
                    onChange={(e) =>
                      updateMetric("productName", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={metrics.price || ""}
                      onChange={(e) =>
                        updateMetric("price", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Monthly Income (€)</Label>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={metrics.monthlyIncome || ""}
                      onChange={(e) =>
                        updateMetric(
                          "monthlyIncome",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="0"
                    value={metrics.discountPercentage || ""}
                    onChange={(e) =>
                      updateMetric(
                        "discountPercentage",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Metrics Card */}
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <MetricSlider
                  label="Utility / Life Improvement Score"
                  hint="How much will this actually improve your daily life?"
                  value={metrics.utilityScore}
                  onChange={(value) => updateMetric("utilityScore", value)}
                />
                <MetricSlider
                  label="Instant Happiness Score"
                  hint="How much joy will you feel right after buying?"
                  value={metrics.instantHappinessScore}
                  onChange={(value) =>
                    updateMetric("instantHappinessScore", value)
                  }
                />
                <MetricSlider
                  label="Sustainability Factor"
                  hint="How long will the happiness last? (1 = days, 10 = years)"
                  value={metrics.sustainabilityScore}
                  onChange={(value) =>
                    updateMetric("sustainabilityScore", value)
                  }
                />
                <MetricSlider
                  label="Upgrade Justification"
                  hint="How much better is this compared to what you own?"
                  value={metrics.upgradeJustification}
                  onChange={(value) =>
                    updateMetric("upgradeJustification", value)
                  }
                />
                <MetricSlider
                  label="Necessity Factor"
                  hint="Is it a want or a need? (1 = pure luxury, 10 = essential)"
                  value={metrics.necessityScore}
                  onChange={(value) => updateMetric("necessityScore", value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Decision Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div
                    className={`text-7xl font-bold ${recommendation.colorClass}`}
                  >
                    {score}
                  </div>
                  <Muted>out of 100</Muted>
                  <Badge
                    variant={recommendation.variant}
                    className="text-lg px-4 py-2"
                  >
                    {recommendation.text}
                  </Badge>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <H3 className="text-base">Interpretation</H3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>75-100:</span>
                      <span className="text-success font-medium">
                        Go for it!
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>60-74:</span>
                      <span className="text-info font-medium">
                        Worth considering
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>40-59:</span>
                      <span className="text-warning font-medium">
                        Think it over
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>0-39:</span>
                      <span className="text-danger font-medium">
                        Skip this one
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <H3 className="text-base">Metric Impact</H3>
                  <Muted className="text-xs">
                    How much each factor influences your final score
                  </Muted>
                  <div className="space-y-2 text-sm mt-3">
                    <div className="flex items-center justify-between">
                      <span>Utility / Life Improvement</span>
                      <Badge variant="outline-danger">High Impact</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Necessity Factor</span>
                      <Badge variant="outline-danger">High Impact</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sustainability Factor</span>
                      <Badge variant="outline-warning">Medium Impact</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Affordability</span>
                      <Badge variant="outline-warning">Medium Impact</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Discount Benefit</span>
                      <Badge variant="outline-success">Low Impact</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Upgrade Justification</span>
                      <Badge variant="outline-success">Low Impact</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Instant Happiness</span>
                      <Badge variant="outline-success">Low Impact</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-end">
          <Button onClick={handleSave} size="lg" className="sm:min-w-[200px]">
            {currentId ? "Update" : "Save"} Calculation
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            className="sm:min-w-[200px]"
          >
            Reset Form
          </Button>
          {currentId && (
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="lg"
              className="sm:min-w-[200px]"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface MetricSliderProps {
  label: string
  hint: string
  value: number
  onChange: (value: number) => void
}

function MetricSlider({ label, hint, value, onChange }: MetricSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-1 flex-1">
          <Label className="text-base">{label}</Label>
          <Muted className="text-xs">{hint}</Muted>
        </div>
        <Badge
          variant="secondary"
          className="ml-4 text-lg min-w-[3rem] justify-center"
        >
          {value}
        </Badge>
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={0}
        max={10}
        step={1}
        className="w-full"
      />
    </div>
  )
}

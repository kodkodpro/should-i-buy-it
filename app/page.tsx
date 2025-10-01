"use client"

import {
  Info,
  MinusIcon,
  PlusIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import pluralize from "pluralize"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useCalculation } from "@/lib/calculation-context"
import { H1, H3, Lead, Muted } from "@/lib/components/ui/typography"
import { getAdvice } from "@/lib/purchase-calculator"
import { formatDate } from "@/lib/utils"

export default function Home() {
  const { metrics, updateMetric, score, recommendation } = useCalculation()
  const advice = getAdvice(metrics, score)

  const coolingOffDate = new Date(
    Date.now() + (7 - metrics.waitingDays) * 24 * 60 * 60 * 1000,
  )

  return (
    <div className="min-h-screen p-4 pb-20 md:pt-12 md:pb-40 w-full">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <H1 className="mb-2">Should I Buy It?</H1>
          <Lead>
            ADHD-Optimized purchase decisions based on deliberation, not
            impulsivity
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
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price after discount (€)</Label>
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
              </CardContent>
            </Card>

            {/* Anti-Impulsivity Metrics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TriangleAlertIcon className="h-5 w-5 text-warning" />
                  Impulse Control Check
                </CardTitle>
                <Muted className="text-xs">
                  These metrics are crucial for preventing ADHD impulsive
                  purchases
                </Muted>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="waitingDays">Days Since First Wanted</Label>
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Decrease days"
                        onClick={() =>
                          updateMetric(
                            "waitingDays",
                            Math.max(0, (metrics.waitingDays || 0) - 1),
                          )
                        }
                        className="h-8 w-8"
                      >
                        <span className="sr-only">Decrease</span>
                        <MinusIcon className="h-4 w-4" />
                      </Button>
                      <Input
                        id="waitingDays"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={metrics.waitingDays || ""}
                        onChange={(e) =>
                          updateMetric(
                            "waitingDays",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Increase days"
                        onClick={() =>
                          updateMetric(
                            "waitingDays",
                            (metrics.waitingDays || 0) + 1,
                          )
                        }
                        className="h-8 w-8"
                      >
                        <span className="sr-only">Increase</span>
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>

                    {metrics.waitingDays < 7 && metrics.waitingDays >= 0 && (
                      <div className="px-3 py-2 rounded-md bg-warning/5 border border-warning/20 lg:mt-0 mt-2 lg:ml-4 flex-1">
                        <Muted className="text-xs">
                          ⏰ Cooling off period: Try waiting{" "}
                          <strong>
                            {7 - metrics.waitingDays} more{" "}
                            {pluralize("day", 7 - metrics.waitingDays)}
                          </strong>
                          . Come back on{" "}
                          <strong>{formatDate(coolingOffDate)}</strong>
                        </Muted>
                      </div>
                    )}
                  </div>
                </div>

                <MetricSlider
                  label="Research Depth"
                  hint="How much research have you done? (0=none, 10=extensive)"
                  value={metrics.researchDepth}
                  onChange={(value) => updateMetric("researchDepth", value)}
                />
                <MetricSlider
                  label="Impulse Resistance"
                  hint="How deliberate does this purchase feel? (0=very impulsive, 10=very planned)"
                  value={metrics.impulseResistance}
                  onChange={(value) => updateMetric("impulseResistance", value)}
                />
              </CardContent>
            </Card>

            {/* Core Value Metrics Card */}
            <Card>
              <CardHeader>
                <CardTitle>Value Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <MetricSlider
                  label="Utility / Life Improvement"
                  hint="How much will this actually improve your daily life? (0=not at all, 10=very much)"
                  value={metrics.utilityScore}
                  onChange={(value) => updateMetric("utilityScore", value)}
                />
                <MetricSlider
                  label="Long-term Value"
                  hint="For how long will this provide value? (0=days, 10=years)"
                  value={metrics.longTermValue}
                  onChange={(value) => updateMetric("longTermValue", value)}
                />
                <MetricSlider
                  label="Use Frequency"
                  hint="How often will you actually use this? (0=rarely, 10=daily)"
                  value={metrics.useFrequency}
                  onChange={(value) => updateMetric("useFrequency", value)}
                />
                <MetricSlider
                  label="Necessity Factor"
                  hint="Is it a want or a need? (1=pure luxury, 10=essential)"
                  value={metrics.necessityScore}
                  onChange={(value) => updateMetric("necessityScore", value)}
                />
              </CardContent>
            </Card>

            {/* Replacement Card */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="hasUnusedSimilar"
                    checked={metrics.hasUnusedSimilar}
                    onCheckedChange={(checked) =>
                      updateMetric("hasUnusedSimilar", checked === true)
                    }
                  />
                  <Label htmlFor="hasUnusedSimilar" className="cursor-pointer">
                    I've bought similar items before that I never use
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isReplacement"
                    checked={metrics.isReplacement}
                    onCheckedChange={(checked) =>
                      updateMetric("isReplacement", checked === true)
                    }
                  />
                  <Label htmlFor="isReplacement" className="cursor-pointer">
                    I'm replacing something I already own
                  </Label>
                </div>
                {metrics.isReplacement && (
                  <MetricSlider
                    label="Upgrade Justification"
                    hint="How much better is this compared to what you own?"
                    value={metrics.upgradeJustification}
                    onChange={(value) =>
                      updateMetric("upgradeJustification", value)
                    }
                  />
                )}
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
                  <div>
                    <div
                      className={`text-7xl font-bold ${recommendation.colorClass}`}
                    >
                      {score}
                    </div>
                    <Muted>out of 100</Muted>
                  </div>
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
                      <span>80-100:</span>
                      <span className="text-success font-medium">
                        Go for it!
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>65-79:</span>
                      <span className="text-info font-medium">
                        Probably worth it
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>45-64:</span>
                      <span className="text-warning font-medium">
                        Wait & think more
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>0-44:</span>
                      <span className="text-danger font-medium">Walk away</span>
                    </div>
                  </div>
                </div>

                {advice.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <H3 className="text-base">Personalized Advice</H3>
                    <div className="space-y-2">
                      {advice.map((tip, index) => {
                        const bgClass =
                          tip.kind === "success"
                            ? "bg-success/5"
                            : tip.kind === "danger"
                              ? "bg-danger/5"
                              : "bg-warning/7"

                        return (
                          <div
                            key={`${tip.emoji}-${index}`}
                            className={`text-sm px-3 py-2.5 rounded-md font-medium ${bgClass}`}
                          >
                            {tip.emoji} {tip.text}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="pt-16 md:pt-32 text-center leading-none">
        <a
          href="https://x.com/AndrewKodkod"
          className="text-xs text-muted-foreground/75 hover:text-foreground hover:underline transition-colors"
        >
          Built with love for myself and for others by
          <br />
          Andrew Kodkod
        </a>
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

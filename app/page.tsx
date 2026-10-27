"use client"

import { useTheme } from "next-themes"
import { type ReactNode, useEffect, useId, useState } from "react"
import { useCalculation } from "@/lib/calculation-context"
import { getAdvice } from "@/lib/purchase-calculator"
import { getSavedCalculations, type SavedCalculation } from "@/lib/storage"
import { formatDate } from "@/lib/utils"

export default function Home() {
  const {
    metrics,
    updateMetric,
    score,
    recommendation,
    currentId,
    setCurrentId,
    handleSave,
    handleReset,
    handleDelete,
    handleNew,
  } = useCalculation()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [pointerInteraction, setPointerInteraction] = useState(false)
  useEffect(() => {
    const onPointer = () => setPointerInteraction(true)
    const onKey = (event: KeyboardEvent) => {
      if (!event.metaKey && !event.ctrlKey && !event.altKey) {
        setPointerInteraction(false)
      }
    }
    document.addEventListener("pointerdown", onPointer, true)
    document.addEventListener("keydown", onKey, true)
    return () => {
      document.removeEventListener("pointerdown", onPointer, true)
      document.removeEventListener("keydown", onKey, true)
    }
  }, [])
  const [saved, setSaved] = useState<SavedCalculation[]>([])
  useEffect(() => {
    setMounted(true)
    const load = () => setSaved(getSavedCalculations())
    load()
    window.addEventListener("storage-updated", load)
    window.addEventListener("storage", load)
    return () => {
      window.removeEventListener("storage-updated", load)
      window.removeEventListener("storage", load)
    }
  }, [])
  const advice = getAdvice(metrics, score)
  const coolingOffDate = new Date(
    Date.now() + (7 - metrics.waitingDays) * 86400000,
  )

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Skip to calculator
      </a>
      <header className="site-header">
        <a className="wordmark" href="https://kodkod.me">
          <span>[</span> akodkod <span>]</span>
        </a>
        <div className="header-links">
          <a href="https://kodkod.me">← kodkod.me</a>
          <label className="theme-label">
            <span className="sr-only">Appearance</span>
            <select
              aria-label="Appearance"
              data-pointer-interaction={pointerInteraction || undefined}
              value={mounted ? theme : "system"}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="system">system</option>
              <option value="light">light</option>
              <option value="dark">dark</option>
            </select>
          </label>
        </div>
      </header>
      <main id="main">
        <section className="hero">
          <p className="eyebrow">A little pause before a purchase</p>
          <h1>
            Should I buy it?<span className="cursor">_</span>
          </h1>
          <p className="intro">
            Think through the cost, the usefulness and the urge to buy.
            <br className="desktop-break" /> Give yourself a moment to decide.
          </p>
        </section>
        <div className="workspace-toolbar">
          <button type="button" onClick={handleNew}>
            + new calculation
          </button>
          <span>Saved on this device</span>
        </div>
        <details className="saved-list">
          <summary>
            Saved calculations <span>[ {saved.length} ]</span>
          </summary>
          {saved.length ? (
            <ul>
              {saved.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={currentId === item.id ? "true" : undefined}
                    onClick={() => setCurrentId(item.id)}
                  >
                    <span>{item.metrics.productName || "Unnamed product"}</span>
                    <span>
                      {item.score}/100 <span aria-hidden="true">↗</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No saved calculations yet. Save one to come back to it later.</p>
          )}
        </details>
        <div className="calculator-layout">
          <div className="questions">
            <Section number="01" title="The purchase">
              <Field label="What are you thinking of buying?" id="productName">
                <input
                  id="productName"
                  placeholder="e.g. A new pair of headphones"
                  value={metrics.productName}
                  onChange={(e) => updateMetric("productName", e.target.value)}
                />
              </Field>
              <div className="money-fields">
                <Field label="Price after discount" id="price">
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={metrics.price || ""}
                    onChange={(e) =>
                      updateMetric("price", Math.max(0, Number(e.target.value)))
                    }
                  />
                </Field>
                <Field label="Discount (%)" id="discount">
                  <input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={metrics.discountPercentage || ""}
                    onChange={(e) =>
                      updateMetric(
                        "discountPercentage",
                        Math.min(100, Math.max(0, Number(e.target.value))),
                      )
                    }
                  />
                </Field>
              </div>
              <Field label="Money left each month" id="freeMonthlyMoney">
                <input
                  id="freeMonthlyMoney"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  aria-describedby="money-hint"
                  value={metrics.freeMonthlyMoney || ""}
                  onChange={(e) =>
                    updateMetric(
                      "freeMonthlyMoney",
                      Math.max(0, Number(e.target.value)),
                    )
                  }
                />
                <p className="hint" id="money-hint">
                  After taxes, rent and bills. Use the same currency as the
                  price.
                </p>
              </Field>
            </Section>
            <Section number="02" title="Give it some time">
              <Field label="How many days have you wanted it?" id="waitingDays">
                <div className="stepper">
                  <button
                    type="button"
                    aria-label="Decrease days"
                    onClick={() =>
                      updateMetric(
                        "waitingDays",
                        Math.max(0, metrics.waitingDays - 1),
                      )
                    }
                  >
                    −
                  </button>
                  <input
                    id="waitingDays"
                    type="number"
                    min="0"
                    step="1"
                    value={metrics.waitingDays}
                    onChange={(e) =>
                      updateMetric(
                        "waitingDays",
                        Math.max(0, Math.floor(Number(e.target.value))),
                      )
                    }
                  />
                  <button
                    type="button"
                    aria-label="Increase days"
                    onClick={() =>
                      updateMetric("waitingDays", metrics.waitingDays + 1)
                    }
                  >
                    +
                  </button>
                  <span>days</span>
                </div>
              </Field>
              {mounted && metrics.waitingDays < 7 && (
                <p className="waiting-note">
                  Try waiting {7 - metrics.waitingDays} more{" "}
                  {metrics.waitingDays === 6 ? "day" : "days"}. Come back on{" "}
                  {formatDate(coolingOffDate)}.
                </p>
              )}
              <MetricSlider
                label="How much research have you done?"
                low="None yet"
                high="Compared carefully"
                value={metrics.researchDepth}
                onChange={(v) => updateMetric("researchDepth", v)}
              />
              <MetricSlider
                label="How planned does this feel?"
                low="An impulse"
                high="Thought it through"
                value={metrics.impulseResistance}
                onChange={(v) => updateMetric("impulseResistance", v)}
              />
            </Section>
            <Section number="03" title="What will it add?">
              <MetricSlider
                label="Will it improve your daily life?"
                low="Not at all"
                high="A lot"
                value={metrics.utilityScore}
                onChange={(v) => updateMetric("utilityScore", v)}
              />
              <MetricSlider
                label="How long will it be useful?"
                low="Days"
                high="Years"
                value={metrics.longTermValue}
                onChange={(v) => updateMetric("longTermValue", v)}
              />
              <MetricSlider
                label="How often will you use it?"
                low="Rarely"
                high="Every day"
                value={metrics.useFrequency}
                onChange={(v) => updateMetric("useFrequency", v)}
              />
              <MetricSlider
                label="Is it a want or a need?"
                low="Pure luxury"
                high="Essential"
                value={metrics.necessityScore}
                onChange={(v) => updateMetric("necessityScore", v)}
              />
            </Section>
            <Section number="04" title="What you already own">
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={metrics.hasUnusedSimilar}
                  onChange={(e) =>
                    updateMetric("hasUnusedSimilar", e.target.checked)
                  }
                />
                <span>I’ve bought similar things that I never use</span>
              </label>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={metrics.isReplacement}
                  onChange={(e) =>
                    updateMetric("isReplacement", e.target.checked)
                  }
                />
                <span>This replaces something I already own</span>
              </label>
              {metrics.isReplacement && (
                <MetricSlider
                  label="How much better is the replacement?"
                  low="About the same"
                  high="Much better"
                  value={metrics.upgradeJustification}
                  onChange={(v) => updateMetric("upgradeJustification", v)}
                />
              )}
            </Section>
          </div>
          <aside className="results" aria-label="Your result">
            <div className="result-inner">
              <fieldset className="score-frame">
                <legend>[ YOUR RESULT ]</legend>
                <output aria-live="polite" aria-atomic="true">
                  <span className="score">
                    {score}
                    <span>/ 100</span>
                  </span>
                  <span className="recommendation">{recommendation.text}</span>
                </output>
                <p className="hint">Updates as you answer</p>
              </fieldset>
              <div className="result-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleSave}
                >
                  {currentId ? "Update calculation" : "Save calculation"}{" "}
                  <span aria-hidden="true">↓</span>
                </button>
                <div className="secondary-actions">
                  <button type="button" onClick={handleReset}>
                    reset fields
                  </button>
                  {currentId && (
                    <button type="button" onClick={handleDelete}>
                      delete saved
                    </button>
                  )}
                </div>
              </div>
              <section className="score-guide">
                <h2>How to read the score</h2>
                <dl>
                  <div>
                    <dt>80–100</dt>
                    <dd>Go for it</dd>
                  </div>
                  <div>
                    <dt>65–79</dt>
                    <dd>Probably worth it</dd>
                  </div>
                  <div>
                    <dt>45–64</dt>
                    <dd>Wait and think more</dd>
                  </div>
                  <div>
                    <dt>00–44</dt>
                    <dd>Walk away</dd>
                  </div>
                </dl>
                <p className="hint">
                  Waiting and planning carry more weight than a discount.
                </p>
              </section>
              {advice.length > 0 && (
                <section className="advice">
                  <h2>A few things to consider</h2>
                  <ul>
                    {advice.map((tip) => (
                      <li key={tip.text}>{tip.text}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </aside>
        </div>
      </main>
      <footer className="site-footer">
        <a href="https://kodkod.me">Made by Andrew Kodkod</a>
        <a href="#main">back to top ↑</a>
      </footer>
    </div>
  )
}

function Section({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: ReactNode
}) {
  return (
    <section className="form-section">
      <div className="section-heading">
        <span>{number}</span>
        <h2>{title}</h2>
      </div>
      <div className="section-content">{children}</div>
    </section>
  )
}
function Field({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: ReactNode
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  )
}
function MetricSlider({
  label,
  low,
  high,
  value,
  onChange,
}: {
  label: string
  low: string
  high: string
  value: number
  onChange: (value: number) => void
}) {
  const id = useId()
  return (
    <div className="metric">
      <div className="metric-heading">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>
          {value}
          <span>/10</span>
        </output>
      </div>
      <input
        id={id}
        type="range"
        min="0"
        max="10"
        step="1"
        value={value}
        aria-describedby={`${id}-scale`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="range-labels" id={`${id}-scale`}>
        <span>0 · {low}</span>
        <span>10 · {high}</span>
      </div>
    </div>
  )
}

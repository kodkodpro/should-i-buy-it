# Should I Buy It? - Project Documentation

## 🎯 App Purpose

**ADHD-optimized purchase decision calculator** designed to help prevent impulsive buying by emphasizing deliberation over instant gratification. Built as a personal utility tool to make smarter purchase decisions based on value, cost, and financial context.

### Core Philosophy
- **Anti-impulsivity focus**: Heavy penalties for rushed decisions
- **Cooling-off periods**: Encourages waiting (7+ days recommended)
- **Learning from history**: Tracks patterns of unused purchases
- **Financial reality**: Uses discretionary income, not total income

## 📊 Metrics System

### Product Information
- **Product Name**: String
- **Price (after discount)**: Number (€)
- **Discount %**: 0-100
- **Free Monthly Money**: Number (€) - *Discretionary income after taxes, rent, utilities*
  - Saved to localStorage and persisted across sessions

### Anti-Impulsivity Metrics (CRITICAL - Highest Impact)
1. **Waiting Days** (Impact: 2.0x - HIGHEST)
   - Days since first wanting the product
   - 0 = major red flag, 7+ = good, 14+ = excellent
   - Shows "cooling off timer" when < 7 days

2. **Impulse Resistance** (Impact: 1.9x)
   - 0-10 scale: How deliberate does this feel?
   - 0 = very impulsive, 10 = very planned

3. **Research Depth** (Impact: 1.7x)
   - 0-10 scale: How much research done?
   - 0 = none, 10 = extensive

4. **Has Unused Similar Items** (Impact: -15 points penalty!)
   - Boolean checkbox
   - "I've bought similar items before that I never use"

### Core Value Metrics
1. **Necessity Factor** (Impact: 1.8x - HIGH)
   - 0-10: Want vs need (1 = luxury, 10 = essential)

2. **Utility / Life Improvement** (Impact: 1.6x)
   - 0-10: How much will this improve daily life?

3. **Long-term Value** (Impact: 1.5x)
   - 0-10: Will this provide value for months/years?

4. **Use Frequency** (Impact: 1.4x)
   - 0-10: How often will you actually use this?

### Financial Metrics
- **Affordability** (Impact: 1.3x)
  - Auto-calculated from price vs free monthly money
  - Stricter thresholds for discretionary income:
    - ≤1%: 10 pts, ≤3%: 9 pts, ≤5%: 8 pts
    - ≤10%: 6 pts, ≤15%: 4 pts, ≤25%: 2 pts
    - >50%: 0 pts

- **Discount Benefit** (Impact: 0.4x - LOW!)
  - Deliberately low to prevent discount-driven impulses

### Replacement Metrics (Optional)
- **Is Replacement**: Boolean
- **Upgrade Justification** (Impact: 0.8x, only if replacement)
  - 0-10: How much better than what you have?

## 🎨 UI Structure

### Layout
- **Responsive**: Mobile-first, desktop-optimized
- **Sidebar**: Saved calculations list + action buttons
- **Main Area**: Form on left (2 columns), results on right (1 column sticky)
- **Theme**: Stone palette with dark mode support

### Main Sections

#### Header
- Title: "Should I Buy It?"
- Subtitle: "ADHD-Optimized purchase decisions based on deliberation, not impulsivity"

#### Left Column (Form)

**1. Product Information Card**
- Product name input
- Price (after discount) input
- Discount % input
- Free Monthly Money input (with helper text: "Money left after taxes, rent and utilities")

**2. Impulse Control Check Card** (highlighted with warning icon)
- Waiting Days input (with +/- buttons)
  - Shows cooling-off timer if < 7 days
  - Format: "Try waiting X more days. Come back on [date]"
- Research Depth slider (0-10)
- Impulse Resistance slider (0-10)

**3. Value Assessment Card**
- Utility / Life Improvement slider (0-10)
- Long-term Value slider (0-10)
- Use Frequency slider (0-10)
- Necessity Factor slider (0-10)

**4. Additional Questions Card**
- Checkbox: "I've bought similar items before that I never use"
- Checkbox: "I'm replacing something I already own"
- Upgrade Justification slider (only shows if replacement checked)

#### Right Column (Results - Sticky)

**Decision Score Card**
- Large score number (0-100) with color based on recommendation
- Badge with recommendation text
- Score ranges:
  - 80-100: "Go for it!" (green/success)
  - 65-79: "Probably Worth It" (blue/info)
  - 45-64: "Wait & Think More" (yellow/warning)
  - 0-44: "Walk Away" (red/danger)

**Personalized Advice Section** (if any)
- Color-coded advice cards:
  - Green (`bg-success/5`): ✅ Positive reinforcement
  - Red (`bg-danger/5`): 🚨 Warnings, ⚠️ Dangers, 💰 Financial alerts, 🎣 Traps
  - Yellow (`bg-warning/5`): 📚 Suggestions, 💭 Questions, 🤔 Considerations

Example advice:
- "🚨 You just thought of this! Wait at least 24 hours before buying."
- "✅ Great job waiting 7 days! Your mind is clearer now."
- "💰 This costs over 15% of your free monthly money. That's a major expense!"

#### Sidebar (Collapsible)

**Header**
- "New Calculation" button

**Content**
- List of saved calculations
- Shows: Product name, timestamp, score badge
- Active calculation highlighted

**Footer**
- "Save/Update Calculation" button
- "Reset" button
- "Delete" button (only if editing existing)
- Calculation count

## 🧮 Formula & Calculation

### Score Calculation (0-100)
1. Calculate individual scores (affordability, waiting period, etc.)
2. Apply impact multipliers to each metric
3. Sum all weighted scores
4. Apply penalty for unused similar items (-15 points)
5. Normalize to 0-100 scale

### Impact Multipliers (Ordered by Priority)
```
HIGHEST (Anti-impulsivity):
- waitingPeriod: 2.0
- impulseResistance: 1.9
- necessity: 1.8
- researchDepth: 1.7

HIGH (Core value):
- utility: 1.6
- longTermValue: 1.5
- useFrequency: 1.4

MEDIUM:
- affordability: 1.3

LOW:
- upgrade: 0.8
- discount: 0.4 (deliberately low!)

PENALTY:
- unusedSimilarPenalty: 1.5 (applies -15 points if checked)
```

### Advice Generation
Dynamic advice based on metrics:
- Waiting period < 3 days → urgent warnings
- Research depth < 4 → "Do more research!"
- Impulse resistance < 4 → "This feels impulsive"
- Price > 15% free money → major expense warning
- Discount > 30% + waiting < 2 days → "ADHD impulse trap!"

## 💾 Storage & State

### LocalStorage Keys
- `free-monthly-money`: Persisted discretionary income (auto-loaded on new calculations)
- `should-i-buy-it-data`: Individual saved calculations

### State Management
- **Context**: `CalculationProvider` manages all state
- **Metrics**: All form values
- **Score & Recommendation**: Auto-calculated from metrics
- **Current Calculation ID**: Tracks editing vs new

### Auto-Save Features
1. **Free Monthly Money**: Saved on every change (if > 0)
2. **Full Calculation**: Manual save via button
3. **Persistence**: Survives page refresh

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15.5.4** (App Router, RSC)
- **React 19.1.1**
- **TypeScript 5**

### Styling
- **Tailwind CSS v4**
- **Tailwind Animate CSS**
- **shadcn/ui** (New York style, Stone palette)
  - Components: Button, Card, Badge, Input, Slider, Checkbox, Label, Sidebar, Toaster

### UI Components Used
- `@/components/ui/*`: All shadcn components
- `@/lib/components/ui/typography.tsx`: H1, H3, Lead, Muted
- Icons: `lucide-react` (TriangleAlertIcon, MinusIcon, PlusIcon, etc.)

### Forms & Validation
- **React Hook Form** 7.63.0
- **Zod** 4.1.11 (schema validation)

### Utilities
- **clsx** + **tailwind-merge**: Class name merging
- **class-variance-authority**: Component variants
- **pluralize**: Pluralization helper
- **sonner**: Toast notifications (instead of alerts)

### Development
- **Biome**: Linting & formatting
- **Bun**: Package manager & runtime

### Key Files Structure
```
/app
  /page.tsx          # Main calculator UI
  /layout.tsx        # Root layout with providers
  /globals.css       # Global styles + CSS variables
/lib
  /purchase-calculator.ts    # Core formula logic
  /calculation-context.tsx   # State management
  /storage.ts                # localStorage utilities
  /utils.ts                  # Shared utilities
  /components/ui/typography.tsx
/components/ui/*             # shadcn components
```

## 🎨 Design System

### Colors (Semantic)
- `--success`: Green (positive outcomes)
- `--info`: Blue (informational)
- `--warning`: Yellow (caution)
- `--danger`: Red (negative/destructive)

### Theme
- Base: Stone palette
- Border radius: 0px (sharp corners)
- Shadows: Neobrutalism style
- Dark mode: Full support via theme provider

### Typography
- Font: Geist Sans (sans-serif)
- Mono: Geist Mono
- Sizes: Standard shadcn scale

## 🚀 Key Features

### UX Enhancements
1. **Cooling-off Timer**: Visual countdown when waiting < 7 days
2. **+/- Buttons**: Easy day increment/decrement for waiting period
3. **Sticky Results**: Decision score visible while scrolling
4. **Auto-Save Free Money**: One-time entry, persisted forever
5. **Toast Notifications**: Non-blocking feedback
6. **Responsive Design**: Mobile-first, desktop-enhanced

### ADHD-Specific Features
1. **Visual Warnings**: Color-coded advice cards
2. **Pattern Recognition**: "Unused similar items" checkbox
3. **Delay Enforcement**: Strong penalties for rushed decisions
4. **Progress Tracking**: Save calculations to review later
5. **Historical Learning**: Compare past purchase decisions

### Developer Experience
- Type-safe with TypeScript
- Component-based architecture
- Centralized state management
- Clean separation of concerns (UI / Logic / Storage)
- Comprehensive formula documentation

## 📝 Usage Flow

1. **First Time**:
   - Enter free monthly money (saved automatically)
   - Fill product details
   - Set all metrics honestly
   - See score + personalized advice
   - Save calculation

2. **Subsequent Use**:
   - Click "New Calculation"
   - Free money auto-filled ✨
   - Enter new product details
   - Metrics reset to defaults (except free money)

3. **Review Mode**:
   - Browse saved calculations in sidebar
   - Click to load and review
   - Update if needed
   - Delete if no longer relevant

## 🎯 Success Criteria

A purchase should ideally have:
- ✅ Waiting period: 7+ days
- ✅ Research depth: 7+
- ✅ Impulse resistance: 7+
- ✅ Necessity or utility: 7+
- ✅ No unused similar items
- ✅ Final score: 65+

Red flags (likely impulsive):
- ❌ Waiting period: 0-2 days
- ❌ Research depth: 0-3
- ❌ Impulse resistance: 0-4
- ❌ Has unused similar items
- ❌ High discount + quick decision
- ❌ Final score: < 45

---

**Built with ❤️ by Andrew Kodkod for personal use and the ADHD community**


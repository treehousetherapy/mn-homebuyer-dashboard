# MN Homebuyer Dashboard — UX Overhaul Design Spec
**Date:** 2026-04-06  
**Status:** Approved  
**Scope:** Full architecture + UI (Option B)

---

## Overview

Redesign the MN Homebuyer Dashboard from a "collection of calculator tools" into a **guided homebuyer journey**. The product already has the right logic (readiness scoring, DPA eligibility, mortgage math, live rates, AI coach, DPA watchlist). This pass restructures the shell, navigation, and page hierarchy to make that logic feel like a trusted coach rather than a spreadsheet.

**Core shift:** Progressive disclosure + journey framing. Show buyers where they are, what they qualify for, and exactly one next step — at all times.

**Reference products:** Linear (calmer nav, clearer orientation), Revolut onboarding (progressive disclosure, one CTA per screen), education platforms (visible progress, personalized nudges).

---

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Router | TanStack Router | Type-safe, file-based, best fit for TS-first Vite app |
| Auth | Optional Supabase | Reduces drop-off; localStorage default, sync available |
| Next action engine | Rule-based ladder | Reliable, auditable, no latency; upgradeable later |
| File structure | Feature modules | Right level for this app's complexity; domain-scoped |

---

## Route Map

```
/                 → HomePage       (onboarding form OR buyer snapshot)
/get-ready        → ReadinessPage
/affordability    → AffordabilityPage
/assistance       → AssistancePage
/homes            → HomesPage
/milestones       → MilestonesPage
/profile          → ProfilePage
```

All routes share `AppShell` layout. `/` redirects to `/get-ready` after profile creation.

---

## File Structure

```
src/
  main.tsx
  router.tsx                        ← TanStack Router route tree
  lib/
    data.ts                         ← PROGRAMS, CURATED, CHECKLIST, COUNTY_TAX
    calc.ts                         ← pmtCalc, calcMort, buyingPower
    profile.ts                      ← Profile type, localStorage load/save
    eligibility.ts                  ← eligibleFor(), readiness score
    nextAction.ts                   ← useNextBestAction() rule engine
  hooks/
    useProfile.ts                   ← unified profile (localStorage + optional Supabase)
    useJourneyPhase.ts              ← current phase + completion %
    useProgramMatches.ts            ← eligProgs + totalDPA derived state
    useMortgage.ts                  ← calcMort, liveRates
  features/
    shell/
      AppShell.tsx                  ← layout wrapper
      Sidebar.tsx                   ← phase-based nav
      TopProgress.tsx               ← "Step N of 5" strip
      MobileNav.tsx                 ← bottom tab bar
      NextStepCard.tsx              ← one-action recommendation card
    onboarding/
      OnboardingForm.tsx            ← profile creation (from App.tsx)
      BuyerSnapshot.tsx             ← hero module (4 tiles)
    readiness/
      ReadinessPage.tsx
      ReadinessGauge.tsx            ← extracted Gauge
      ReadinessChecklist.tsx        ← extracted checklist items
      CreditRoadmap.tsx             ← new: shown when FICO < 620
    affordability/
      AffordabilityPage.tsx
      ScenarioBuilder.tsx           ← sliders + loan type
      MortgageBreakdown.tsx         ← FHA vs Conv table
      DonutChart.tsx                ← extracted DonutChart
    assistance/
      AssistancePage.tsx
      ProgramMatchCard.tsx          ← Best fit / Worth exploring / Needs one step
      ProgramDetailDrawer.tsx       ← collapsible program details
    homes/
      HomesPage.tsx
      ReachNowGrid.tsx              ← price ≤ buyingPower.dtiMax
      ReachWithDPAGrid.tsx          ← price ≤ buyingPower.totalPower
      StretchGrid.tsx               ← price ≤ buyingPower.totalPower * 1.15
      PropertyCard.tsx              ← extracted from App.tsx
      PropertyDetailPanel.tsx       ← extracted from App.tsx
    milestones/
      MilestonesPage.tsx
      MilestoneChecklist.tsx
      DocumentChecklist.tsx
      KeyContacts.tsx
      AIChatWrapper.tsx             ← wraps AIChatbot with suggested prompts
    profile/
      ProfilePage.tsx
      SaveProgressPrompt.tsx        ← optional Supabase auth CTA
  components/
    ui/                             ← shadcn components (unchanged)
    DPAWatchlist.tsx                ← existing (relocated)
    AIChatbot.tsx                   ← existing (relocated)
  index.css                         ← design tokens updated
```

---

## Shell & Navigation

### Sidebar (desktop)

- **Background:** `hsl(215 25% 12%)` — dimmer than current, more recessive
- **Width:** 220px expanded / 56px collapsed (same toggle)
- **Logo row:** navigates to `/` (existing behavior)
- **Phase nav items:**

| # | Label | Route | Icon |
|---|---|---|---|
| 1 | Get Ready | `/get-ready` | `LineChart` |
| 2 | Your Budget | `/affordability` | `Wallet` |
| 3 | Help Available | `/assistance` | `Gift` |
| 4 | Find a Home | `/homes` | `Search` |
| 5 | Close with Confidence | `/milestones` | `ClipboardCheck` |

- **Active state:** `border-l-2 border-[var(--brand-green)] bg-white/8 text-white`
- **Inactive:** `text-white/50 hover:text-white/80 hover:bg-white/4`
- **Phase numbers:** small dim `text-white/30` label to left of icon
- **Footer:** "Edit profile" (→ `/profile`) + "Reset" (confirmation dialog)

### TopProgress strip

- Height 44px, `bg-white border-b border-slate-100`
- Left: `"Step N of 5 · [Phase Name]"` — `text-sm font-medium text-slate-700`
- Center: `<Progress>` bar, 240px wide, value = journey completion %
- Right: "Home" button (→ `/`), desktop only
- Hidden when profile is empty

### Journey completion %

Computed in `useJourneyPhase.ts`:
- Phase 1 complete: income + FICO + county entered (>0)
- Phase 2 complete: price slider moved from default OR loan type changed
- Phase 3 complete: at least 1 program selected
- Phase 4 complete: at least 1 property viewed
- Phase 5 complete: at least 3 checklist items checked

### MobileNav (bottom tab bar)

- Same 5 phase icons
- **Active:** `text-[var(--brand-green)] bg-emerald-50/60 rounded-xl`
- `bg-white/95 backdrop-blur border-t border-border/80`
- Height: `py-2` with icon + label

### NextStepCard

Persistent card below TopProgress, above page content.

```
┌─────────────────────────────────────────────────────────┐
│  ● [rule-based message]                    [Do this →]  │
└─────────────────────────────────────────────────────────┘
```

- `bg-emerald-50 border border-emerald-200/80 rounded-xl px-4 py-3`
- Dot: `w-2 h-2 rounded-full bg-emerald-500 animate-pulse`
- Dismissible: `sessionStorage.setItem('nextStepDismissed', '1')`
- Hidden when profile is empty

---

## Rule Engine (`lib/nextAction.ts`)

Returns `{ message: string; cta: string; href: string }`. First match wins:

| Priority | Condition | Message | CTA → href |
|---|---|---|---|
| 1 | income = 0 | "Enter your income to see your buying power" | "Get started" → `/get-ready` |
| 2 | fico < 620 | "Your credit score needs work — see your roadmap" | "See roadmap" → `/get-ready` |
| 3 | !education | "Complete homebuyer education to unlock DPA programs" | "Learn more" → `/assistance` |
| 4 | savings < 5000 | "Build your savings — you need at least $5K to close" | "See targets" → `/affordability` |
| 5 | firstGen && First-Gen DPA closed | "Join the First-Gen DPA alert list" | "Join list" → `/assistance` |
| 6 | back DTI > 43% | "Reduce monthly debt to qualify for more homes" | "See options" → `/affordability` |
| 7 | selProgs.size = 0 | "Review programs you may qualify for" | "See programs" → `/assistance` |
| 8 | no property viewed | "Explore homes within your budget" | "Browse homes" → `/homes` |
| 9 | checklist < 50% | "Work through your closing checklist" | "Open checklist" → `/milestones` |
| 10 | default | "You're on track — keep going!" | "Continue" → current phase route |

---

## Pages

### HomePage (`/`)

**No profile:** Renders `<OnboardingForm />`. On submit → navigate to `/get-ready`.

**Profile exists:** Renders `<BuyerSnapshot />` hero with 4 tiles:
- Readiness score + label
- Estimated budget (with DPA)
- Top matched program (name + amount)
- Next action pill (from rule engine)

Below hero:
- Top 3 program matches (`ProgramMatchCard` compact variant)
- 2 homes in reach (`PropertyCard` compact variant)
- Journey phase completion list (which phases have data)

### ReadinessPage (`/get-ready`)

- `ReadinessGauge` — large, centered
- `ReadinessChecklist` — 6 items with ✓/✗ + detail text
- `DonutChart` — payment breakdown at current price
- Financial snapshot table (income, debt, effective debt, DTI)
- Debt reduction slider
- Student loan + self-employment callout boxes
- **New:** `CreditRoadmap` — shown if FICO < 620:
  - 3 concrete steps: "Check all 3 bureaus free at annualcreditreport.com", "Dispute errors", "Pay down revolving balances below 30%"

### AffordabilityPage (`/affordability`)

- Left col: `ScenarioBuilder` (price, rate, down %, loan type, live rates box)
- Right col: `MortgageBreakdown` (FHA vs Conv table, buying power summary)
- **New:** Scenario comparison — "Pin this scenario" button saves current inputs; second pinned scenario shows side-by-side. Max 2 pinned scenarios. State in component local state only (no persistence needed).

### AssistancePage (`/assistance`)

Programs grouped into 3 tiers:

**BEST FIT** — `ok: true`, `status: "open"`  
Full `ProgramMatchCard`:
- Program name + short description
- "Why it matches you" — 1–2 sentence human explanation (generated from eligibility fields)
- Max DPA amount
- Primary CTA (Join alert list / Apply / Compare payment)
- Expandable `ProgramDetailDrawer` with full rule table, URL, phone

**WORTH EXPLORING** — `ok: true`, `status: "closed"` (portal closed but eligible)  
Compact `ProgramMatchCard`:
- Name + amount
- Status badge
- "See details" expander

**NEEDS ONE MORE STEP** — `ok: false`  
Minimal card showing only: program name, why it doesn't match, what would need to change.

`DPAWatchlist` at bottom of page (existing component, unchanged).

### HomesPage (`/homes`)

Three horizontal sections with explanatory headers:

```
Homes within reach now
"Based on your $[dtiMax] buying power"
[PropertyCard] [PropertyCard] [PropertyCard]  →

Reachable with your DPA programs
"Up to $[totalDPA] additional from selected programs"
[PropertyCard] [PropertyCard] [PropertyCard]  →

Stretch goals
"If your monthly debt dropped by $X/mo"
[PropertyCard] [PropertyCard] [PropertyCard]  →
```

- Each row: horizontal scroll on mobile, 2-col grid on desktop
- Clicking any card sets `selectedProperty` state + shows `PropertyDetailPanel` as right-panel on desktop / bottom sheet on mobile
- "Find more on Zillow" link buttons + "Analyze any price" input stay in a collapsible panel at top

### MilestonesPage (`/milestones`)

- `MilestoneChecklist` with `<Progress>` bar
- `DocumentChecklist` (static, no checkboxes)
- `KeyContacts`
- `AIChatWrapper` with 4 suggested prompt chips above input:
  - "What is DPA?"
  - "How do I improve my credit fast?"
  - "What documents do lenders need?"
  - "How long does closing take?"

### ProfilePage (`/profile`)

- Full profile edit form (same fields as onboarding)
- `SaveProgressPrompt` — shows if user has never connected Supabase:
  - "Save your profile across devices" with magic link email input
  - Powered by `supabase.auth.signInWithOtp()`
  - On success: sync localStorage profile to `user_profiles` table

---

## Visual System Changes

### Design tokens (`index.css`)

```css
:root {
  /* Sidebar — dimmer */
  --sidebar: hsl(215 25% 12%);

  /* Surfaces */
  --surface-1: hsl(215 20% 97%);   /* page background */
  --surface-2: hsl(0 0% 100%);     /* card background */
  --surface-3: hsl(215 18% 95%);   /* inset / secondary panel */

  /* Badge colors — restricted to 3 semantic uses */
  /* emerald = eligible/good, amber = warning, slate = neutral info */
}
```

### Card rules

- **Remove** `dashboard-card` from inner nested panels
- **Keep** `dashboard-card` only for top-level content blocks (one per view column)
- Use `bg-[var(--surface-3)] rounded-lg p-3` for nested groupings instead of card-on-card
- Badge colors: `emerald`, `amber`, `slate` only — no sky, red, or gold for decoration

### Motion

- Keep `fade-in`, `slide-up`
- **New:** `.stagger-children > * { animation: _fi 0.4s ease both; }` with `nth-child` delays 0, 60ms, 120ms, 180ms

---

## Data Flow

### `useProfile.ts` (unified hook)

```ts
// Returns profile from localStorage
// If user is signed in via Supabase, also syncs on mount
// setProfile: writes to localStorage + Supabase if authed
export function useProfile(): {
  profile: Profile
  setProfile: (updates: Partial<Profile>) => Promise<void>
  isAuthed: boolean
  loading: boolean
}
```

Replaces both `Profile` state in App.tsx and the existing `useBuyerProfile.ts`.

### `useProgramMatches.ts`

```ts
export function useProgramMatches(profile: Profile, price: number): {
  eligProgs: (DPA & { ok: boolean; reason: string })[]
  totalDPA: number
  selProgs: Set<string>
  toggleProg: (id: string) => void
}
```

Extracts the `eligProgs`, `totalDPA`, `selProgs`, `toggleProg` logic from App.tsx.

### `useMortgage.ts`

```ts
export function useMortgage(profile: Profile, price: number, totalDPA: number): {
  rate: number
  setRate: (r: number) => void
  loanType: "fha" | "conv"
  setLoanType: (t: "fha" | "conv") => void
  downPct: number
  setDownPct: (v: number) => void
  mort: MortResult
  mortAlt: MortResult
  liveRates: LiveRates | null
}
```

### `useJourneyPhase.ts`

```ts
export function useJourneyPhase(
  profile: Profile,
  selProgs: Set<string>,
  selectedPropertyId: number | null,
  checkCount: number
): {
  currentPhase: 1 | 2 | 3 | 4 | 5
  completionPct: number
  phaseName: string
}
```

---

## Dependencies to Add

```bash
npm install @tanstack/react-router @tanstack/router-devtools
```

No other new runtime dependencies. TanStack Router replaces the current `view` state toggling.

---

## Out of Scope (for this pass)

- Multilingual mode
- Celebration/confetti animations on milestone completion
- Scenario compare persistence
- Supabase auth for new users (only optional sync for existing localStorage profiles)
- Full AI-driven next action engine (rule-based is the implementation)
- RapidAPI Zillow search (spotlight stays as the listing source)

---

## Build Order

1. **Week 1:** Install TanStack Router, create route tree, extract `lib/` files from App.tsx, build `AppShell` + `Sidebar` + `TopProgress` + `MobileNav`
2. **Week 2:** Build `useProfile`, `useProgramMatches`, `useMortgage`, `useJourneyPhase`, `nextAction`. Build `HomePage` with `BuyerSnapshot` + `OnboardingForm`. Build `NextStepCard`.
3. **Week 3:** Port each view into its feature module: `ReadinessPage`, `AffordabilityPage`, `AssistancePage` (new program tier layout), `HomesPage` (3-tier).
4. **Week 4:** Build `MilestonesPage` with `AIChatWrapper`, `ProfilePage` with `SaveProgressPrompt`, visual polish (CSS tokens, card rules, stagger animation, `CreditRoadmap`).

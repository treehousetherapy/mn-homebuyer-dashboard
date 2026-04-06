# MN Homebuyer Dashboard — Plan A: Foundation
# (Router · Lib Extraction · AppShell)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install TanStack Router, extract all data/logic from `src/App.tsx` into focused `lib/` files, and build the `AppShell` layout (Sidebar, TopProgress, MobileNav) so every subsequent plan can slot pages into it.

**Architecture:** TanStack Router replaces the current `view` state toggle. All static data, types, helpers, and profile storage move from `App.tsx` into `src/lib/`. A new `AppShell` component owns the chrome (sidebar, top strip, mobile nav); `App.tsx` becomes a thin router bootstrap.

**Tech Stack:** React 19, Vite, TypeScript, TanStack Router v1, Tailwind CSS, shadcn/ui, lucide-react

---

## Pre-flight

Before starting, run:
```bash
npm run build   # must pass — baseline clean build
npm run lint    # must pass (0 errors)
```

If either fails, fix them before proceeding.

---

## Task 1: Install TanStack Router

**Files:**
- Modify: `package.json`
- Create: `src/router.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Install the packages**

```bash
npm install @tanstack/react-router
npm install --save-dev @tanstack/router-devtools
```

Verify install:
```bash
npm list @tanstack/react-router
# Expected: @tanstack/react-router@1.x.x
```

- [ ] **Step 2: Create `src/router.tsx` with a minimal 2-route tree**

```tsx
// src/router.tsx
import { createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <div>Home (placeholder)</div>,
})

const routeTree = rootRoute.addChildren([indexRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

- [ ] **Step 3: Wire router into `src/main.tsx`**

Replace the entire file:

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```

Expected: `✓ built in X.Xs` with no TypeScript errors. The app will show "Home (placeholder)" at `/`.

- [ ] **Step 5: Commit**

```bash
git add src/router.tsx src/main.tsx package.json package-lock.json
git commit -m "feat: install TanStack Router and wire into main.tsx"
```

---

## Task 2: Extract `src/lib/types.ts`

All shared TypeScript interfaces extracted from `App.tsx` into one file. This must happen before other `lib/` extractions because they all depend on these types.

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Create `src/lib/types.ts`**

```ts
// src/lib/types.ts

export interface Profile {
  name: string
  income: number
  fico: number
  debt: number
  savings: number
  county: string
  household: number
  jobYears: number
  firstTime: boolean
  firstGen: boolean
  education: boolean
  studentLoanBal: number
  studentLoanIDR: boolean
  isSelfEmployed: boolean
  debtReduce: number
}

export interface DPA {
  id: string
  name: string
  short: string
  max: number
  pctCap?: number
  type: string
  forgiveYrs?: number
  incomeLimit: number
  ficoMin: number
  priceLimit: number
  status: 'open' | 'closed'
  coverage: string
  url: string
  phone: string
  notes: string
  reqFirstTime: boolean
  reqFirstGen: boolean
}

export interface Listing {
  id: number
  name: string
  price: number
  beds: number
  baths: number
  sqft: number
  city: string
  builder: string
  url: string
  image?: string
}

export interface SearchResult {
  zpid: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  livingArea: number
  imgSrc: string
  detailUrl: string
  city: string
}

export interface MortResult {
  dp: number
  cc: number
  cash: number
  oop: number
  loan: number
  tl: number
  pi: number
  tax: number
  ins: number
  mip: number
  pmi: number
  total: number
  fDTI: number
  bDTI: number
  dpPct: number
}

export interface LiveRates {
  rate30: number
  rate15: number
  date: string
}

export type ToggleField = 'firstTime' | 'firstGen' | 'education' | 'isSelfEmployed'
```

- [ ] **Step 2: Verify the file compiles**

```bash
npx tsc --noEmit
```

Expected: 0 errors. (App.tsx still has its own inline types — that's OK for now; they'll be removed in Task 6.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: extract shared TypeScript types to lib/types.ts"
```

---

## Task 3: Extract `src/lib/data.ts`

Static data constants moved out of `App.tsx`.

**Files:**
- Create: `src/lib/data.ts`

- [ ] **Step 1: Create `src/lib/data.ts`**

```ts
// src/lib/data.ts
import type { DPA, Listing } from './types'

export const COUNTY_TAX: Record<string, number> = {
  Anoka: 0.0115, Carver: 0.0105, Chisago: 0.011, Dakota: 0.011,
  Hennepin: 0.0125, Isanti: 0.0115, Ramsey: 0.013, Scott: 0.0108,
  Sherburne: 0.011, Washington: 0.0112, Wright: 0.0108,
}

export const COUNTIES = [
  '', 'Anoka', 'Carver', 'Chisago', 'Dakota', 'Hennepin',
  'Isanti', 'Ramsey', 'Scott', 'Sherburne', 'Washington', 'Wright', 'Other MN',
]

export const PROGRAMS: DPA[] = [
  { id: 'firstgen', name: 'First-Generation Homebuyers Community DPA Fund', short: 'First-Gen DPA', max: 32000, pctCap: 10, type: 'Forgivable (5yr)', forgiveYrs: 5, incomeLimit: 132400, ficoMin: 0, priceLimit: 515200, status: 'closed', coverage: 'Statewide', url: 'firstgendpa.org', phone: 'firstgendpa.org', notes: '0% interest, forgiven 20%/yr. Portal currently closed.', reqFirstTime: false, reqFirstGen: true },
  { id: 'welcome', name: 'Welcome Home Down Payment Assistance', short: 'Welcome Home', max: 50000, pctCap: 30, type: 'Forgivable (10yr)', forgiveYrs: 10, incomeLimit: 160000, ficoMin: 0, priceLimit: 766550, status: 'open', coverage: 'Statewide', url: 'nwhomepartners.org', phone: '651-292-8710', notes: 'Up to 30% of price capped at $50K. Approved partners only.', reqFirstTime: true, reqFirstGen: false },
  { id: 'startup', name: 'MHFA Start Up + Deferred Payment Loan', short: 'MHFA Start Up', max: 18000, type: 'Deferred (0%)', incomeLimit: 152200, ficoMin: 640, priceLimit: 659550, status: 'open', coverage: 'Statewide', url: 'mnhousing.gov', phone: 'mnhousing.gov', notes: 'Below-market rate + up to $18K DPA.', reqFirstTime: true, reqFirstGen: false },
  { id: 'dakotacda', name: 'Dakota County CDA First Time Homebuyer', short: 'Dakota CDA', max: 8500, type: 'Deferred (0%)', incomeLimit: 103900, ficoMin: 640, priceLimit: 515300, status: 'open', coverage: 'Dakota County', url: 'dakotacda.org', phone: '651-675-4472', notes: '+ MCC up to $2K/yr tax credit.', reqFirstTime: true, reqFirstGen: false },
  { id: 'commkeys', name: 'Community Keys Plus Impact', short: 'Community Keys+', max: 20000, type: 'Deferred (0%)', incomeLimit: 120000, ficoMin: 0, priceLimit: 515200, status: 'open', coverage: '5-county metro', url: 'nwhomepartners.org', phone: '651-292-8710', notes: 'Census tract restricted.', reqFirstTime: false, reqFirstGen: false },
  { id: 'stepup', name: 'MHFA Step Up Program', short: 'MHFA Step Up', max: 14000, type: 'Monthly Payment', incomeLimit: 170000, ficoMin: 640, priceLimit: 659550, status: 'open', coverage: 'Statewide', url: 'mnhousing.gov', phone: 'mnhousing.gov', notes: 'For buyers exceeding Start Up limits.', reqFirstTime: false, reqFirstGen: false },
  { id: 'chenoa', name: 'Chenoa Fund DPA', short: 'Chenoa Fund', max: 20000, pctCap: 3.5, type: 'Forgivable (3yr)', forgiveYrs: 3, incomeLimit: 999999, ficoMin: 620, priceLimit: 552000, status: 'open', coverage: 'Nationwide', url: 'chenoafund.org', phone: 'chenoafund.org', notes: 'Covers FHA 3.5% as second mortgage.', reqFirstTime: false, reqFirstGen: false },
  { id: 'naf', name: 'New American Funding DPA', short: 'NAF DPA', max: 6000, type: 'Deferred', incomeLimit: 999999, ficoMin: 620, priceLimit: 766550, status: 'open', coverage: 'Nationwide', url: 'newamericanfunding.com', phone: 'newamericanfunding.com', notes: 'Combinable with MN Housing DPA.', reqFirstTime: false, reqFirstGen: false },
]

// Real Zillow listing metadata; images resolved server-side from property pages.
export const CURATED: Listing[] = [
  { id: 1, name: '4767 218th St W', price: 394910, beds: 4, baths: 3, sqft: 1828, city: 'Farmington', builder: 'Lennar', url: 'https://www.zillow.com/homedetails/4767-218th-St-W-Farmington-MN-55024/459877037_zpid/' },
  { id: 2, name: '21603 Azalea Ln', price: 319970, beds: 3, baths: 3, sqft: 1792, city: 'Farmington', builder: 'Lennar', url: 'https://www.zillow.com/homedetails/21603-Azalea-Ln-Farmington-MN-55024/460211335_zpid/' },
  { id: 3, name: '4474 223rd St W', price: 424900, beds: 4, baths: 3, sqft: 2425, city: 'Farmington', builder: 'Capstone Homes', url: 'https://www.zillow.com/homedetails/4474-223rd-St-W-Farmington-MN-55024/461444789_zpid/' },
  { id: 4, name: '4482 223rd St W', price: 379900, beds: 3, baths: 3, sqft: 1603, city: 'Farmington', builder: 'Capstone Homes', url: 'https://www.zillow.com/homedetails/4482-223rd-St-W-Farmington-MN-55024/461471513_zpid/' },
  { id: 5, name: '4768 218th St W', price: 361990, beds: 3, baths: 2, sqft: 1281, city: 'Farmington', builder: 'Lennar', url: 'https://www.zillow.com/homedetails/4768-218th-St-W-Farmington-MN-55024/460212288_zpid/' },
  { id: 6, name: '21653 Lilac Dr', price: 359985, beds: 3, baths: 3, sqft: 1906, city: 'Farmington', builder: 'Lennar', url: 'https://www.zillow.com/homedetails/21653-Lilac-Dr-Farmington-MN-55024/460212315_zpid/' },
  { id: 7, name: 'The Sawyer Plan', price: 379990, beds: 2, baths: 2, sqft: 1240, city: 'Farmington', builder: 'D.R. Horton', url: 'https://www.zillow.com/community/whispering-fields/458366099_zpid/' },
  { id: 8, name: '11046 203rd St W', price: 364975, beds: 3, baths: 3, sqft: 1580, city: 'Lakeville', builder: 'Lennar', url: 'https://www.zillow.com/homedetails/11046-203rd-St-W-Lakeville-MN-55044/460212292_zpid/' },
  { id: 9, name: '17559 Driscoll Pl', price: 329990, beds: 3, baths: 3, sqft: 1707, city: 'Lakeville', builder: 'D.R. Horton', url: 'https://www.zillow.com/homedetails/17559-Driscoll-Pl-Lakeville-MN-55044/459847583_zpid/' },
  { id: 10, name: '20318 Gadget Cir', price: 519375, beds: 4, baths: 3, sqft: 3379, city: 'Lakeville', builder: 'Lennar', url: 'https://www.zillow.com/homedetails/20318-Gadget-Cir-Lakeville-MN-55044/459429162_zpid/' },
]

export const CHECKLIST = [
  { id: 'credit', label: 'Check credit score (all 3 bureaus)', tip: 'Free at annualcreditreport.com. Lenders use FICO 2, 4, 5.' },
  { id: 'w2', label: 'Gather 2 years W-2s / tax returns', tip: 'Also: 2mo bank statements, 30 days paystubs, photo ID.' },
  { id: 'education', label: 'Complete homebuyer education', tip: 'Home Stretch or Framework online. BEFORE purchase agreement.' },
  { id: 'counselor', label: 'Meet HUD-certified counselor', tip: 'Free at hocmn.org.' },
  { id: 'preapproval', label: 'Get pre-approval letter', tip: 'Shop 3+ lenders within 14 days.' },
  { id: 'dpa', label: 'Apply for DPA programs', tip: 'First-come, first-served. Be ready when portals open.' },
  { id: 'agent', label: 'Find a buyer\'s agent', tip: 'Typically paid by seller. Ask about First-Gen experience.' },
  { id: 'offer', label: 'Make an offer', tip: 'Earnest money is typically 1-2% of price.' },
]
```

- [ ] **Step 2: Verify compiles**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/data.ts
git commit -m "feat: extract static data to lib/data.ts"
```

---

## Task 4: Extract `src/lib/profile.ts`

Profile type, storage key, load/save logic.

**Files:**
- Create: `src/lib/profile.ts`

- [ ] **Step 1: Create `src/lib/profile.ts`**

```ts
// src/lib/profile.ts
import type { Profile } from './types'

export const STORAGE_KEY = 'mn_homebuyer_v2'

export const DEFAULT_PROFILE: Profile = {
  name: '',
  income: 0,
  fico: 0,
  debt: 0,
  savings: 0,
  county: '',
  household: 1,
  jobYears: 0,
  firstTime: false,
  firstGen: false,
  education: false,
  studentLoanBal: 0,
  studentLoanIDR: false,
  isSelfEmployed: false,
  debtReduce: 0,
}

export function loadProfile(): Profile | null {
  try {
    const d = localStorage.getItem(STORAGE_KEY)
    return d ? (JSON.parse(d) as Profile) : null
  } catch {
    return null
  }
}

export function saveProfile(p: Profile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    // storage not available — silent fail
  }
}

export function hasProfile(p: Profile): boolean {
  return p.income > 0 && p.fico > 0 && p.county !== ''
}
```

- [ ] **Step 2: Verify compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/profile.ts
git commit -m "feat: extract profile storage to lib/profile.ts"
```

---

## Task 5: Extract `src/lib/calc.ts`

All financial math helpers.

**Files:**
- Create: `src/lib/calc.ts`

- [ ] **Step 1: Create `src/lib/calc.ts`**

```ts
// src/lib/calc.ts
import type { Profile, MortResult, LiveRates } from './types'
import { COUNTY_TAX } from './data'

export const fmt = (n: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export const fmtK = (n: number): string =>
  n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : fmt(n)

export const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v))

export const getTax = (county: string): number => COUNTY_TAX[county] ?? 0.012

export function pmtCalc(principal: number, annualRate: number, years: number): number {
  const mr = annualRate / 100 / 12
  const n = years * 12
  if (mr === 0) return principal / n
  return (principal * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1)
}

export interface CalcMortInput {
  price: number
  rate: number
  loanType: 'fha' | 'conv'
  downPct: number     // only used when loanType === 'conv'
  totalDPA: number
  taxRate: number
  monthlyIncome: number
  effectiveDebt: number
}

export function calcMort(input: CalcMortInput): MortResult {
  const { price, rate, loanType, downPct, totalDPA, taxRate, monthlyIncome, effectiveDebt } = input
  const dpPct = loanType === 'fha' ? 3.5 : downPct
  const dp = price * dpPct / 100
  const cc = price * 0.03
  const cash = dp + cc
  const oop = Math.max(0, cash - totalDPA)
  const loan = price - dp
  const mipUp = loanType === 'fha' ? loan * 0.0175 : 0
  const tl = loan + mipUp
  const pi = pmtCalc(tl, rate, 30)
  const tax = (price * taxRate) / 12
  const ins = 200
  const mip = loanType === 'fha' ? (loan * 0.0055) / 12 : 0
  const pmi = loanType === 'conv' && dpPct < 20 ? (loan * 0.007) / 12 : 0
  const total = pi + tax + ins + mip + pmi
  const mi = monthlyIncome || 1
  const fDTI = (total / mi) * 100
  const bDTI = ((total + effectiveDebt) / mi) * 100
  return { dp, cc, cash, oop, loan, tl, pi, tax, ins, mip, pmi, total, fDTI, bDTI, dpPct }
}

export interface BuyingPower {
  maxLoan: number
  dtiMax: number     // max purchase price from DTI alone (no DPA)
  totalPower: number // dtiMax + DPA
}

export function calcBuyingPower(
  monthlyIncome: number,
  effectiveDebt: number,
  rate: number,
  totalDPA: number,
): BuyingPower {
  if (monthlyIncome <= 0) return { maxLoan: 0, dtiMax: 0, totalPower: 0 }
  const maxPmt = monthlyIncome * 0.43 - effectiveDebt
  if (maxPmt <= 0) return { maxLoan: 0, dtiMax: 0, totalPower: 0 }
  const mr = rate / 100 / 12
  const n = 360
  const maxLoan = mr === 0 ? maxPmt * n : maxPmt * (Math.pow(1 + mr, n) - 1) / (mr * Math.pow(1 + mr, n))
  const dtiMax = Math.round((maxLoan / (1 - 0.035)) / 1000) * 1000
  const totalPower = dtiMax + Math.round(totalDPA * 0.8 / 1000) * 1000
  return { maxLoan, dtiMax, totalPower }
}

export function effectiveDebt(p: Profile): number {
  const studentDebt = p.studentLoanIDR ? p.studentLoanBal * 0.005 : 0
  return Math.max(0, p.debt - p.debtReduce + studentDebt)
}

const FRED_API_KEY = 'bc24a6a30bee3e3219bbd6dd8bb7e01d'

async function fetchFredRate(series: string): Promise<{ rate: number; date: string } | null> {
  if (!FRED_API_KEY) return null
  try {
    const res = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`
    )
    const data = await res.json()
    const obs = data?.observations?.[0]
    if (!obs || obs.value === '.') return null
    return { rate: parseFloat(obs.value), date: obs.date }
  } catch {
    return null
  }
}

export async function fetchLiveRates(): Promise<LiveRates | null> {
  if (!FRED_API_KEY) return null
  try {
    const [r30, r15] = await Promise.all([
      fetchFredRate('MORTGAGE30US'),
      fetchFredRate('MORTGAGE15US'),
    ])
    if (!r30) return null
    return { rate30: r30.rate, rate15: r15?.rate ?? 0, date: r30.date }
  } catch {
    return null
  }
}
```

- [ ] **Step 2: Verify compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/calc.ts
git commit -m "feat: extract financial calculations to lib/calc.ts"
```

---

## Task 6: Extract `src/lib/eligibility.ts`

Program eligibility logic and readiness score.

**Files:**
- Create: `src/lib/eligibility.ts`

- [ ] **Step 1: Create `src/lib/eligibility.ts`**

```ts
// src/lib/eligibility.ts
import type { DPA, Profile } from './types'

export interface EligResult {
  ok: boolean
  reason: string
}

export function eligibleFor(pr: DPA, p: Profile): EligResult {
  if (pr.reqFirstGen && !p.firstGen) return { ok: false, reason: 'First-gen only' }
  if (pr.reqFirstTime && !p.firstTime) return { ok: false, reason: 'First-time only' }
  if (p.income > pr.incomeLimit && pr.incomeLimit < 900000) return { ok: false, reason: 'Income over limit' }
  if (p.fico < pr.ficoMin && pr.ficoMin > 0) return { ok: false, reason: `FICO < ${pr.ficoMin}` }
  return { ok: true, reason: 'Eligible' }
}

export interface ReadinessItem {
  label: string
  ok: boolean
  detail: string
}

export interface ReadinessScore {
  score: number
  label: string
  color: string
  items: ReadinessItem[]
}

export function calcReadiness(p: Profile, effectiveDebt: number, monthlyIncome: number): ReadinessScore {
  const items: ReadinessItem[] = [
    {
      label: 'Credit Score',
      ok: p.fico >= 620,
      detail: p.fico >= 740 ? 'Excellent' : p.fico >= 670 ? 'Good' : p.fico >= 620 ? 'Meets minimum' : 'Below 620',
    },
    {
      label: 'Employment',
      ok: p.jobYears >= 2,
      detail: p.jobYears >= 2
        ? `${p.jobYears}yr (meets req)`
        : `${p.jobYears}yr${p.isSelfEmployed ? ' self-employed' : ''} — need 2+`,
    },
    {
      label: 'Income',
      ok: p.income > 0,
      detail: p.income > 0 ? `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p.income)}/yr` : 'Enter income',
    },
    {
      label: 'DTI',
      ok: monthlyIncome > 1 && (effectiveDebt / monthlyIncome) * 100 <= 43,
      detail: monthlyIncome > 1
        ? `${((effectiveDebt / monthlyIncome) * 100).toFixed(0)}% — ${(effectiveDebt / monthlyIncome) * 100 <= 43 ? 'healthy' : 'over 43%'}`
        : 'N/A',
    },
    {
      label: 'Savings',
      ok: p.savings >= 5000,
      detail: p.savings >= 5000
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p.savings)
        : 'Build reserves',
    },
    {
      label: 'Education',
      ok: p.education,
      detail: p.education ? 'Done' : 'Required for DPA',
    },
  ]
  const score = Math.round((items.filter((i) => i.ok).length / items.length) * 100)
  const label = score >= 80 ? 'Ready' : score >= 60 ? 'Almost' : score >= 40 ? 'Getting There' : 'Needs Work'
  const color = score >= 80 ? '#2d6a2e' : score >= 60 ? '#d4a017' : score >= 40 ? '#ea580c' : '#dc2626'
  return { score, label, color, items }
}
```

- [ ] **Step 2: Verify compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/eligibility.ts
git commit -m "feat: extract eligibility and readiness logic to lib/eligibility.ts"
```

---

## Task 7: Create `src/lib/nextAction.ts`

Rule-based next step engine. Pure function + React hook wrapper.

**Files:**
- Create: `src/lib/nextAction.ts`

- [ ] **Step 1: Create `src/lib/nextAction.ts`**

```ts
// src/lib/nextAction.ts
import type { Profile } from './types'
import { PROGRAMS } from './data'

export interface NextAction {
  message: string
  cta: string
  href: string
}

/**
 * Returns the single highest-priority recommended action for this buyer.
 * First match wins. Pure function — no React dependency.
 */
export function getNextAction(
  profile: Profile,
  selProgs: Set<string>,
  selectedPropertyId: number | null,
  checkCount: number,
  effectiveDebt: number,
  monthlyIncome: number,
): NextAction {
  const dti = monthlyIncome > 0 ? (effectiveDebt / monthlyIncome) * 100 : 0
  const firstGenDPAClosed = PROGRAMS.find((p) => p.id === 'firstgen')?.status === 'closed'

  // Priority 1: no income entered
  if (profile.income === 0) {
    return { message: 'Enter your income to see your buying power', cta: 'Get started', href: '/get-ready' }
  }
  // Priority 2: credit too low
  if (profile.fico < 620) {
    return { message: 'Your credit score needs work — see your improvement roadmap', cta: 'See roadmap', href: '/get-ready' }
  }
  // Priority 3: no education
  if (!profile.education) {
    return { message: 'Complete homebuyer education to unlock DPA programs', cta: 'Learn more', href: '/assistance' }
  }
  // Priority 4: insufficient savings
  if (profile.savings < 5000) {
    return { message: 'Build your savings — you need at least $5K to close', cta: 'See targets', href: '/affordability' }
  }
  // Priority 5: first-gen with closed portal
  if (profile.firstGen && firstGenDPAClosed) {
    return { message: 'Join the First-Gen DPA alert list to be notified when the portal reopens', cta: 'Join list', href: '/assistance' }
  }
  // Priority 6: DTI too high
  if (dti > 43) {
    return { message: 'Reduce monthly debt to qualify for more homes', cta: 'See options', href: '/affordability' }
  }
  // Priority 7: no programs selected
  if (selProgs.size === 0) {
    return { message: 'Review programs you may qualify for', cta: 'See programs', href: '/assistance' }
  }
  // Priority 8: no property viewed
  if (selectedPropertyId === null) {
    return { message: 'Explore homes within your budget', cta: 'Browse homes', href: '/homes' }
  }
  // Priority 9: checklist under 50%
  if (checkCount < 4) {
    return { message: 'Work through your closing checklist', cta: 'Open checklist', href: '/milestones' }
  }
  // Priority 10: default
  return { message: "You're on track — keep going!", cta: 'Continue', href: '/get-ready' }
}
```

- [ ] **Step 2: Verify compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/nextAction.ts
git commit -m "feat: add rule-based next action engine"
```

---

## Task 8: Build `src/features/shell/Sidebar.tsx`

Desktop phase-based sidebar navigation. Does not depend on router yet — uses `window.location.pathname` for active state detection in this task, to be upgraded to TanStack router `useRouterState` in Task 10.

**Files:**
- Create: `src/features/shell/Sidebar.tsx`

- [ ] **Step 1: Create `src/features/shell/Sidebar.tsx`**

```tsx
// src/features/shell/Sidebar.tsx
import { useState } from 'react'
import { LineChart, Wallet, Gift, Search, ClipboardCheck, Home, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
const logoImg = faviconLink?.href ?? './logo.png'

const PHASES = [
  { num: 1, label: 'Get Ready',             href: '/get-ready',     Icon: LineChart },
  { num: 2, label: 'Your Budget',           href: '/affordability', Icon: Wallet },
  { num: 3, label: 'Help Available',        href: '/assistance',    Icon: Gift },
  { num: 4, label: 'Find a Home',           href: '/homes',         Icon: Search },
  { num: 5, label: 'Close with Confidence', href: '/milestones',    Icon: ClipboardCheck },
]

interface SidebarProps {
  onReset?: () => void
}

export function Sidebar({ onReset }: SidebarProps) {
  const [open, setOpen] = useState(true)
  const [resetConfirm, setResetConfirm] = useState(false)
  const pathname = window.location.pathname

  return (
    <aside
      className={`flex flex-col flex-shrink-0 transition-all duration-300 ${open ? 'w-[220px]' : 'w-14'}`}
      style={{ background: 'hsl(215 25% 12%)', minHeight: '100vh', position: 'sticky', top: 0 }}
    >
      {/* Header row */}
      <div className="flex items-center gap-1 border-b border-white/10 p-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/70"
          aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span className="text-lg leading-none">≡</span>
        </button>
        <a
          href="/"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1.5 pl-1 pr-2 transition-colors hover:bg-white/10"
          title="Go home"
        >
          <img src={logoImg} alt="" className="h-8 w-8 shrink-0 object-contain" />
          {open && (
            <span className="truncate text-sm font-semibold tracking-tight" style={{ color: '#d4a017' }}>
              MN Homebuyer
            </span>
          )}
        </a>
      </div>

      {/* Phase nav */}
      <nav className="flex-1 py-2">
        {PHASES.map((phase) => {
          const active = pathname === phase.href || pathname.startsWith(phase.href + '/')
          return (
            <a
              key={phase.href}
              href={phase.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors border-l-2 no-underline ${
                active
                  ? 'border-[#2d6a2e] bg-white/8 text-white'
                  : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/4'
              }`}
            >
              {/* Phase number */}
              {open && (
                <span className="text-[10px] font-medium text-white/30 w-3 shrink-0 tabular-nums">
                  {phase.num}
                </span>
              )}
              <phase.Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              {open && <span className="text-xs font-medium leading-tight">{phase.label}</span>}
            </a>
          )
        })}
      </nav>

      {/* Footer */}
      {open && (
        <div className="border-t border-white/10 p-3 space-y-1">
          <a
            href="/profile"
            className="flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-[11px] text-white/60 hover:text-white hover:bg-white/5 no-underline transition-colors"
          >
            <User className="h-3.5 w-3.5 shrink-0" />
            Edit profile
          </a>
          {!resetConfirm ? (
            <button
              type="button"
              onClick={() => setResetConfirm(true)}
              className="flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-[11px] text-white/30 hover:text-red-300 hover:bg-white/5 transition-colors"
            >
              <Home className="h-3.5 w-3.5 shrink-0" />
              Reset profile
            </button>
          ) : (
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="destructive"
                className="h-7 flex-1 text-[10px]"
                onClick={() => {
                  onReset?.()
                  setResetConfirm(false)
                }}
              >
                Yes, reset
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 flex-1 text-[10px] text-white/60 hover:text-white"
                onClick={() => setResetConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
```

- [ ] **Step 2: Verify compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/features/shell/Sidebar.tsx
git commit -m "feat: build Sidebar component with phase-based navigation"
```

---

## Task 9: Build `src/features/shell/MobileNav.tsx`

Bottom tab bar for mobile.

**Files:**
- Create: `src/features/shell/MobileNav.tsx`

- [ ] **Step 1: Create `src/features/shell/MobileNav.tsx`**

```tsx
// src/features/shell/MobileNav.tsx
import { LineChart, Wallet, Gift, Search, ClipboardCheck } from 'lucide-react'

const TABS = [
  { label: 'Get Ready',  href: '/get-ready',     Icon: LineChart },
  { label: 'Budget',     href: '/affordability', Icon: Wallet },
  { label: 'Help',       href: '/assistance',    Icon: Gift },
  { label: 'Homes',      href: '/homes',         Icon: Search },
  { label: 'Close',      href: '/milestones',    Icon: ClipboardCheck },
]

export function MobileNav() {
  const pathname = window.location.pathname

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-border/80 flex justify-around py-2 shadow-[0_-8px_30px_rgba(26,46,68,0.08)]">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <a
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl min-w-[3.25rem] transition-colors no-underline ${
              active ? 'text-[#2d6a2e] bg-emerald-50/60' : 'text-muted-foreground'
            }`}
          >
            <tab.Icon className="h-5 w-5" aria-hidden />
            <span className="text-[9px] font-medium leading-tight text-center">{tab.label}</span>
          </a>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/features/shell/MobileNav.tsx
git commit -m "feat: build MobileNav bottom tab bar"
```

---

## Task 10: Build `src/features/shell/TopProgress.tsx`

Top strip showing current journey phase and completion progress.

**Files:**
- Create: `src/features/shell/TopProgress.tsx`

- [ ] **Step 1: Create `src/features/shell/TopProgress.tsx`**

```tsx
// src/features/shell/TopProgress.tsx
import { Home } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

const PHASE_MAP: Record<string, { num: number; name: string }> = {
  '/get-ready':     { num: 1, name: 'Get Ready' },
  '/affordability': { num: 2, name: 'Your Budget' },
  '/assistance':    { num: 3, name: 'Help Available' },
  '/homes':         { num: 4, name: 'Find a Home' },
  '/milestones':    { num: 5, name: 'Close with Confidence' },
}

interface TopProgressProps {
  completionPct: number
  hasProfile: boolean
}

export function TopProgress({ completionPct, hasProfile }: TopProgressProps) {
  if (!hasProfile) return null

  const pathname = window.location.pathname
  // Match the longest prefix
  const phase = Object.entries(PHASE_MAP)
    .filter(([href]) => pathname === href || pathname.startsWith(href + '/'))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1]

  return (
    <div className="h-11 flex items-center px-4 gap-4 bg-white border-b border-slate-100 shrink-0">
      {/* Phase label */}
      <span className="text-sm font-medium text-slate-700 shrink-0">
        {phase ? `Step ${phase.num} of 5 · ${phase.name}` : 'MN Homebuyer Dashboard'}
      </span>

      {/* Progress bar */}
      <div className="flex-1 max-w-[240px]">
        <Progress value={completionPct} className="h-1.5" />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Home button — desktop only */}
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:inline-flex h-8 gap-1.5 border-slate-200 bg-white px-3 text-slate-700 shadow-sm text-xs"
        asChild
      >
        <a href="/"><Home className="h-3.5 w-3.5" />Home</a>
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Verify compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/features/shell/TopProgress.tsx
git commit -m "feat: build TopProgress strip"
```

---

## Task 11: Build `src/features/shell/NextStepCard.tsx`

Persistent one-action recommendation card.

**Files:**
- Create: `src/features/shell/NextStepCard.tsx`

- [ ] **Step 1: Create `src/features/shell/NextStepCard.tsx`**

```tsx
// src/features/shell/NextStepCard.tsx
import { useState } from 'react'
import { X } from 'lucide-react'
import type { NextAction } from '@/lib/nextAction'

const DISMISS_KEY = 'nextStepDismissed'

interface NextStepCardProps {
  action: NextAction
  hasProfile: boolean
}

export function NextStepCard({ action, hasProfile }: NextStepCardProps) {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISS_KEY) === '1'
  )

  if (!hasProfile || dismissed) return null

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="mx-4 mt-3 flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50 px-4 py-3">
      {/* Pulse dot */}
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>

      {/* Message */}
      <p className="flex-1 text-sm text-emerald-900 leading-snug">{action.message}</p>

      {/* CTA */}
      <a
        href={action.href}
        className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors no-underline whitespace-nowrap"
      >
        {action.cta} →
      </a>

      {/* Dismiss */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="shrink-0 text-emerald-600/60 hover:text-emerald-700 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/features/shell/NextStepCard.tsx
git commit -m "feat: build NextStepCard persistent recommendation"
```

---

## Task 12: Build `src/features/shell/AppShell.tsx`

Compose Sidebar + TopProgress + MobileNav + NextStepCard into a full layout wrapper.

**Files:**
- Create: `src/features/shell/AppShell.tsx`

- [ ] **Step 1: Create `src/features/shell/AppShell.tsx`**

```tsx
// src/features/shell/AppShell.tsx
import { type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TopProgress } from './TopProgress'
import { MobileNav } from './MobileNav'
import { NextStepCard } from './NextStepCard'
import type { NextAction } from '@/lib/nextAction'

interface AppShellProps {
  children: ReactNode
  completionPct: number
  hasProfile: boolean
  nextAction: NextAction
  onReset: () => void
}

export function AppShell({ children, completionPct, hasProfile, nextAction, onReset }: AppShellProps) {
  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar onReset={onReset} />
      </div>

      {/* Main column */}
      <div className="flex flex-1 flex-col min-h-0 overflow-auto pb-20 md:pb-0 dashboard-page-bg">
        <TopProgress completionPct={completionPct} hasProfile={hasProfile} />
        <NextStepCard action={nextAction} hasProfile={hasProfile} />

        {/* Page content */}
        <main className="flex-1 mx-auto w-full max-w-[1300px] p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
```

- [ ] **Step 2: Verify compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/features/shell/AppShell.tsx
git commit -m "feat: build AppShell layout wrapper"
```

---

## Task 13: Wire AppShell into the router with a placeholder root layout

Update `src/router.tsx` to use `AppShell` for all routes, keeping `App.tsx` intact for now. This gives us the shell visible in the browser before any page content is migrated.

**Files:**
- Modify: `src/router.tsx`
- Create: `src/features/shell/RootLayout.tsx`

- [ ] **Step 1: Create `src/features/shell/RootLayout.tsx`**

This is the root route component that holds application-level state and feeds it to AppShell.

```tsx
// src/features/shell/RootLayout.tsx
import { Outlet } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { AppShell } from './AppShell'
import { loadProfile, saveProfile, hasProfile, DEFAULT_PROFILE, STORAGE_KEY } from '@/lib/profile'
import { effectiveDebt, calcBuyingPower } from '@/lib/calc'
import { PROGRAMS } from '@/lib/data'
import { eligibleFor } from '@/lib/eligibility'
import { getNextAction } from '@/lib/nextAction'
import type { Profile } from '@/lib/types'

export function RootLayout() {
  const [profile, setProfileState] = useState<Profile>(() => loadProfile() ?? DEFAULT_PROFILE)
  const [selProgs, setSelProgs] = useState<Set<string>>(new Set())
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null)
  const [checkCount, setCheckCount] = useState(0)
  const [price, setPrice] = useState(350000)
  const [rate, setRate] = useState(7.0)
  const [totalDPA, setTotalDPA] = useState(0)

  // Persist profile changes
  useEffect(() => {
    if (hasProfile(profile)) saveProfile(profile)
  }, [profile])

  // Clear legacy storage key
  useEffect(() => {
    try { localStorage.removeItem('mn_homebuyer_profile') } catch { /* ok */ }
  }, [])

  const effDebt = useMemo(() => effectiveDebt(profile), [profile])
  const mi = profile.income / 12 || 1

  // Auto-select eligible programs on first load
  useEffect(() => {
    setSelProgs((prev) => {
      if (prev.size > 0) return prev
      const s = new Set<string>()
      PROGRAMS.forEach((pr) => {
        const { ok } = eligibleFor(pr, profile)
        if (ok && pr.status !== 'closed') s.add(pr.id)
      })
      return s
    })
  }, [profile])

  // Recalculate totalDPA when selProgs or price changes
  useEffect(() => {
    let t = 0
    selProgs.forEach((id) => {
      const pr = PROGRAMS.find((x) => x.id === id)
      if (!pr) return
      let a = pr.max
      if (pr.pctCap) a = Math.min(a, price * pr.pctCap / 100)
      t += a
    })
    setTotalDPA(t)
  }, [selProgs, price])

  const buyingPower = useMemo(
    () => calcBuyingPower(profile.income / 12, effDebt, rate, totalDPA),
    [profile.income, effDebt, rate, totalDPA]
  )

  // Journey completion %
  const completionPct = useMemo(() => {
    let done = 0
    if (profile.income > 0 && profile.fico > 0 && profile.county !== '') done++
    if (price !== 350000 || totalDPA > 0) done++
    if (selProgs.size > 0) done++
    if (selectedPropertyId !== null) done++
    if (checkCount >= 3) done++
    return Math.round((done / 5) * 100)
  }, [profile, price, totalDPA, selProgs, selectedPropertyId, checkCount])

  const nextAction = useMemo(
    () => getNextAction(profile, selProgs, selectedPropertyId, checkCount, effDebt, mi),
    [profile, selProgs, selectedPropertyId, checkCount, effDebt, mi]
  )

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setProfileState(DEFAULT_PROFILE)
    setSelProgs(new Set())
    setSelectedPropertyId(null)
    setCheckCount(0)
    window.location.href = '/'
  }

  // Context values passed via props to pages (Plans B and C will add React Context)
  const appContext = {
    profile,
    setProfile: (updates: Partial<Profile>) => {
      setProfileState((prev) => ({ ...prev, ...updates }))
    },
    selProgs,
    setSelProgs,
    selectedPropertyId,
    setSelectedPropertyId,
    checkCount,
    setCheckCount,
    price,
    setPrice,
    rate,
    setRate,
    totalDPA,
    buyingPower,
    effDebt,
  }

  return (
    <AppShell
      completionPct={completionPct}
      hasProfile={hasProfile(profile)}
      nextAction={nextAction}
      onReset={handleReset}
    >
      {/* Pages receive appContext through router search params + context in Plan B */}
      <Outlet context={appContext} />
    </AppShell>
  )
}
```

- [ ] **Step 2: Update `src/router.tsx` with all 7 routes and the shell**

```tsx
// src/router.tsx
import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from '@tanstack/react-router'
import { RootLayout } from './features/shell/RootLayout'

// Root route — renders AppShell for all children
const rootRoute = createRootRoute({
  component: RootLayout,
})

// Placeholder page component until Plans C/D replace them
const Placeholder = ({ name }: { name: string }) => (
  <div className="p-8 text-center text-slate-500">
    <p className="text-lg font-semibold">{name}</p>
    <p className="text-sm mt-1">Page coming in Plan C</p>
  </div>
)

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Placeholder name="Home" />,
})

const getReadyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/get-ready',
  component: () => <Placeholder name="Get Ready" />,
})

const affordabilityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/affordability',
  component: () => <Placeholder name="Your Budget" />,
})

const assistanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assistance',
  component: () => <Placeholder name="Help Available" />,
})

const homesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/homes',
  component: () => <Placeholder name="Find a Home" />,
})

const milestonesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/milestones',
  component: () => <Placeholder name="Close with Confidence" />,
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => <Placeholder name="Profile" />,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  getReadyRoute,
  affordabilityRoute,
  assistanceRoute,
  homesRoute,
  milestonesRoute,
  profileRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

Expected: `✓ built` with no errors. Navigating to `http://localhost:5173/get-ready` should show the sidebar, top progress strip, and "Get Ready — Page coming in Plan C".

- [ ] **Step 4: Commit**

```bash
git add src/features/shell/RootLayout.tsx src/router.tsx
git commit -m "feat: wire AppShell into router with placeholder pages"
```

---

## Task 14: Add `.gitignore` entry for brainstorming session files

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add `.superpowers/` to `.gitignore`**

Open `.gitignore` and add at the bottom:

```
# Brainstorming session files
.superpowers/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore .superpowers/ brainstorm session files"
```

---

## Task 15: Final verification

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: `✓ built in X.Xs`, 0 TypeScript errors.

- [ ] **Step 2: Lint**

```bash
npm run lint
```

Expected: 0 errors (warnings OK if pre-existing).

- [ ] **Step 3: Manual smoke test**

```bash
npm run preview
```

Open `http://localhost:4173` in browser. Verify:
- Sidebar appears on desktop with 5 phase links
- Clicking each nav link changes the URL and shows the correct placeholder
- Mobile nav appears at bottom on narrow viewport
- TopProgress strip shows "Step N of 5 · [Phase Name]"
- Home link in TopProgress navigates to `/`

- [ ] **Step 4: Push**

```bash
git push
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ TanStack Router installed and wired
- ✅ `lib/types.ts` — all shared types extracted
- ✅ `lib/data.ts` — PROGRAMS, CURATED, CHECKLIST, COUNTY_TAX extracted
- ✅ `lib/profile.ts` — Profile storage extracted, `hasProfile()` added
- ✅ `lib/calc.ts` — all math functions, `calcBuyingPower`, `fetchLiveRates`
- ✅ `lib/eligibility.ts` — `eligibleFor`, `calcReadiness`
- ✅ `lib/nextAction.ts` — rule engine, all 10 priorities
- ✅ `features/shell/Sidebar.tsx` — phase nav, dimmed style, reset confirm
- ✅ `features/shell/MobileNav.tsx` — 5 tabs, active state
- ✅ `features/shell/TopProgress.tsx` — step indicator, progress bar, home button
- ✅ `features/shell/NextStepCard.tsx` — dismissible, pulse dot, CTA
- ✅ `features/shell/AppShell.tsx` — composes all shell components
- ✅ `features/shell/RootLayout.tsx` — application state, feeds AppShell

**Note:** `App.tsx` still exists unchanged. It is no longer rendered (router takes over) but is not yet deleted. It will be deleted in Plan C once all views are migrated.

**Note:** `src/hooks/useBuyerProfile.ts` still exists but is unused. Plan B will supersede it with `src/hooks/useProfile.ts`, at which point `useBuyerProfile.ts` is deleted.

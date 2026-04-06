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

/** Row styling: strong = best tier, ok = meets minimums, weak = needs attention */
export type ReadinessTier = 'strong' | 'ok' | 'weak'

export interface ReadinessItem {
  label: string
  tier: ReadinessTier
  detail: string
}

export interface ReadinessScore {
  score: number
  label: string
  color: string
  items: ReadinessItem[]
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Weighted 0–100 strength score (not “6/6 boxes checked = 100%”).
 * The gauge reflects how strong the file is; rows show strong / ok / weak tiers.
 */
export function calcReadiness(p: Profile, effDebt: number, monthlyIncome: number): ReadinessScore {
  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  const dtiPct = monthlyIncome > 1 ? (effDebt / monthlyIncome) * 100 : 0

  // Sub-scores 0–100 for weighting
  let creditPts = 0
  if (p.fico < 620) creditPts = 0
  else if (p.fico >= 740) creditPts = 100
  else creditPts = lerp(35, 95, (p.fico - 620) / (740 - 620))

  const employmentPts = p.jobYears >= 2 ? 100 : 0

  const incomePts = p.income > 0 ? 100 : 0

  let dtiPts = 0
  if (monthlyIncome <= 1) dtiPts = 0
  else if (dtiPct <= 36) dtiPts = 100
  else if (dtiPct <= 43) dtiPts = lerp(100, 72, (dtiPct - 36) / (43 - 36))
  else if (dtiPct <= 50) dtiPts = lerp(72, 25, (dtiPct - 43) / (50 - 43))
  else dtiPts = clamp(25 - (dtiPct - 50) * 3, 0, 25)

  const savingsPts =
    p.savings <= 0
      ? 0
      : p.savings < 5000
        ? clamp((p.savings / 5000) * 48, 0, 48)
        : p.savings >= 20000
          ? 100
          : lerp(72, 99, (p.savings - 5000) / (20000 - 5000))

  const educationPts = p.education ? 100 : 0

  const W = { credit: 0.22, employment: 0.18, income: 0.1, dti: 0.25, savings: 0.15, education: 0.1 }
  const score = Math.round(
    W.credit * creditPts +
      W.employment * employmentPts +
      W.income * incomePts +
      W.dti * dtiPts +
      W.savings * savingsPts +
      W.education * educationPts,
  )

  const creditTier: ReadinessTier =
    p.fico < 620 ? 'weak' : p.fico >= 740 ? 'strong' : 'ok'
  const employmentTier: ReadinessTier = p.jobYears >= 2 ? 'strong' : 'weak'
  const incomeTier: ReadinessTier = p.income > 0 ? 'strong' : 'weak'
  const dtiTier: ReadinessTier =
    monthlyIncome <= 1 ? 'weak' : dtiPct <= 36 ? 'strong' : dtiPct <= 43 ? 'ok' : 'weak'
  const savingsTier: ReadinessTier =
    p.savings >= 20000 ? 'strong' : p.savings >= 5000 ? 'ok' : 'weak'
  const educationTier: ReadinessTier = p.education ? 'strong' : 'weak'

  const items: ReadinessItem[] = [
    {
      label: 'Credit Score',
      tier: creditTier,
      detail: p.fico >= 740 ? 'Excellent' : p.fico >= 670 ? 'Good' : p.fico >= 620 ? 'Meets minimum' : 'Below 620',
    },
    {
      label: 'Employment',
      tier: employmentTier,
      detail: p.jobYears >= 2
        ? `${p.jobYears}yr (meets req)`
        : `${p.jobYears}yr${p.isSelfEmployed ? ' self-employed' : ''} — need 2+`,
    },
    {
      label: 'Income',
      tier: incomeTier,
      detail: p.income > 0 ? `${fmtCurrency(p.income)}/yr` : 'Enter income',
    },
    {
      label: 'DTI',
      tier: dtiTier,
      detail:
        monthlyIncome > 1
          ? `${dtiPct.toFixed(0)}% — ${dtiPct <= 36 ? 'strong' : dtiPct <= 43 ? 'within limit' : 'over 43%'}`
          : 'N/A',
    },
    {
      label: 'Savings',
      tier: savingsTier,
      detail:
        p.savings >= 20000
          ? `${fmtCurrency(p.savings)} — strong reserves`
          : p.savings >= 5000
            ? `${fmtCurrency(p.savings)} — meets typical minimum`
            : 'Build reserves (aim $5K+)',
    },
    {
      label: 'Education',
      tier: educationTier,
      detail: p.education ? 'Done' : 'Required for DPA',
    },
  ]

  const label = score >= 85 ? 'Ready' : score >= 68 ? 'Almost' : score >= 45 ? 'Getting There' : 'Needs Work'
  const color = score >= 85 ? '#2d6a2e' : score >= 68 ? '#d4a017' : score >= 45 ? '#ea580c' : '#dc2626'

  return { score, label, color, items }
}

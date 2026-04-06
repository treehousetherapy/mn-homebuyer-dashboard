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

export function calcReadiness(p: Profile, effDebt: number, monthlyIncome: number): ReadinessScore {
  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  const dtiPct = monthlyIncome > 1 ? (effDebt / monthlyIncome) * 100 : 0

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
      detail: p.income > 0 ? `${fmtCurrency(p.income)}/yr` : 'Enter income',
    },
    {
      label: 'DTI',
      ok: monthlyIncome > 1 && dtiPct <= 43,
      detail: monthlyIncome > 1
        ? `${dtiPct.toFixed(0)}% — ${dtiPct <= 43 ? 'healthy' : 'over 43%'}`
        : 'N/A',
    },
    {
      label: 'Savings',
      ok: p.savings >= 5000,
      detail: p.savings >= 5000 ? fmtCurrency(p.savings) : 'Build reserves',
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

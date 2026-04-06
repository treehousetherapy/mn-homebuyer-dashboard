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
  downPct: number
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
  dtiMax: number
  totalPower: number
}

export function calcBuyingPower(
  monthlyIncome: number,
  effDebt: number,
  rate: number,
  totalDPA: number,
): BuyingPower {
  if (monthlyIncome <= 0) return { maxLoan: 0, dtiMax: 0, totalPower: 0 }
  const maxPmt = monthlyIncome * 0.43 - effDebt
  if (maxPmt <= 0) return { maxLoan: 0, dtiMax: 0, totalPower: 0 }
  const mr = rate / 100 / 12
  const n = 360
  const maxLoan = mr === 0
    ? maxPmt * n
    : maxPmt * (Math.pow(1 + mr, n) - 1) / (mr * Math.pow(1 + mr, n))
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

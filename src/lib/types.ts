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

/** Shape expected by `/api/chat` and AIChatbot (legacy name). */
export interface BuyerProfile {
  annualIncome: number
  creditScore: number
  isFirstGen: boolean
  targetCity: string
  monthlyDebt: number
}

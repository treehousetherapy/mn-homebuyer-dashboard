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
  { id: 'agent', label: "Find a buyer's agent", tip: 'Typically paid by seller. Ask about First-Gen experience.' },
  { id: 'offer', label: 'Make an offer', tip: 'Earnest money is typically 1-2% of price.' },
]

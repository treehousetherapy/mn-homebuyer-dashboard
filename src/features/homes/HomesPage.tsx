import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAppContext } from '@/features/shell/RootLayout'
import { CURATED } from '@/lib/data'
import { fmt, calcMort } from '@/lib/calc'
import type { Listing, SearchResult } from '@/lib/types'
import { PropertyCard } from '@/features/homes/PropertyCard'
import { Row } from '@/features/shared/Row'
import { logoImg } from '@/features/shared/logo'

export function HomesPage() {
  const ctx = useAppContext()
  const {
    profile,
    price,
    setPrice,
    rate,
    loanType,
    downPct,
    totalDPA,
    buyingPower,
    effDebt,
    selectedPropertyId,
    setSelectedPropertyId,
  } = ctx

  const [spotlightListings, setSpotlightListings] = useState<Listing[]>(CURATED)
  const [spotlightLoading, setSpotlightLoading] = useState(false)
  const [customPrice, setCustomPrice] = useState(0)
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)

  useEffect(() => {
    let ignore = false
    setSpotlightLoading(true)
    fetch('/api/zillow-spotlight')
      .then(async (res) => {
        if (!res.ok) throw new Error('spotlight_fetch_failed')
        return res.json()
      })
      .then((data: { listings?: Listing[] }) => {
        if (ignore || !Array.isArray(data?.listings) || data.listings.length === 0) return
        setSpotlightListings(data.listings)
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setSpotlightLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const curatedInBudgetCount = useMemo(() => {
    if (buyingPower.totalPower <= 0) return 0
    return spotlightListings.filter((l) => l.price <= buyingPower.totalPower).length
  }, [buyingPower.totalPower, spotlightListings])

  const selectProperty = useCallback(
    (listing: Listing) => {
      setSelectedPropertyId(listing.id)
      setSelectedResult(null)
      setPrice(listing.price)
    },
    [setPrice, setSelectedPropertyId],
  )

  const mi = profile.income / 12 || 1
  const taxRate = ctx.taxRate

  const detailMort = calcMort({
    price,
    rate,
    loanType,
    downPct,
    totalDPA,
    taxRate,
    monthlyIncome: mi,
    effectiveDebt: effDebt,
  })

  const sel =
    selectedResult
      ? {
          name: selectedResult.address,
          price: selectedResult.price,
          beds: selectedResult.bedrooms,
          baths: selectedResult.bathrooms,
          sqft: selectedResult.livingArea,
          city: selectedResult.city,
          image: selectedResult.imgSrc,
          url: selectedResult.detailUrl,
        }
      : selectedPropertyId != null
        ? spotlightListings.find((l) => l.id === selectedPropertyId)
        : null

  return (
    <div className="space-y-4">
      <header className="pb-5">
        <h1 className="text-2xl font-bold text-slate-800">Find a Home</h1>
        <p className="text-sm text-slate-400 mt-1">Search on Zillow, then analyze listings against your budget and DPA.</p>
      </header>

      <div className="grid lg:grid-cols-5 gap-4 fade-in">
        <div className="lg:col-span-2 space-y-3">
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base font-semibold">Find Homes</CardTitle>
              {buyingPower.totalPower > 0 && (
                <CardDescription className="text-xs">
                  Budget: up to{' '}
                  <strong style={{ color: 'var(--brand-green)' }}>{fmt(buyingPower.totalPower)}</strong> (with DPA)
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Search on Zillow</p>
                <p className="text-[11px] text-muted-foreground">
                  Open Zillow filtered to your budget. Copy a price back here to analyze it.
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    ['Farmington', 'Farmington-MN'],
                    ['Lakeville', 'Lakeville-MN'],
                    ['Eagan', 'Eagan-MN'],
                    ['Apple Valley', 'Apple-Valley-MN'],
                    ['Rosemount', 'Rosemount-MN'],
                    ['Burnsville', 'Burnsville-MN'],
                    ['Dakota County', 'dakota-county-mn'],
                    ['South Metro', 'twin-cities-mn'],
                  ].map(([label, slug]) => (
                    <a
                      key={label}
                      href={`https://www.zillow.com/${slug}/?searchQueryState=${encodeURIComponent(
                        JSON.stringify({
                          filterState: {
                            price: { max: buyingPower.totalPower || 550000 },
                            beds: { min: 2 },
                            isNewConstruction: { value: true },
                          },
                        }),
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="text-[10px] h-7 w-full justify-start gap-1.5">
                        <span>↗</span> {label}
                      </Button>
                    </a>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Analyze Any Listing</p>
                <p className="text-[11px] text-muted-foreground mb-2">Enter a list price to see DTI and payment.</p>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-muted-foreground">$</span>
                  <Input
                    type="number"
                    placeholder="e.g. 425000"
                    value={customPrice || ''}
                    onChange={(e) => setCustomPrice(+e.target.value)}
                    className="text-xs h-8"
                  />
                  <Button
                    size="sm"
                    className="h-8 text-xs px-4 brand-btn text-white"
                    disabled={!customPrice}
                    onClick={() => {
                      if (!customPrice) return
                      setPrice(customPrice)
                      setSelectedPropertyId(null)
                      setSelectedResult({
                        zpid: 'custom',
                        address: `Custom listing at ${fmt(customPrice)}`,
                        price: customPrice,
                        bedrooms: 0,
                        bathrooms: 0,
                        livingArea: 0,
                        imgSrc: '',
                        detailUrl: '',
                        city: '',
                      })
                    }}
                  >
                    Analyze
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card overflow-hidden border-slate-200/90 shadow-md">
            <div className="bg-gradient-to-br from-[#1a2e44] via-[#1e4a2a] to-[#2d6a2e] px-4 py-3 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">South Metro spotlight</p>
              <CardTitle className="text-base font-bold text-white mt-1">Zillow new construction</CardTitle>
              <p className="text-xs text-white/85 mt-1.5 leading-relaxed">
                Live new-construction picks from Zillow—scroll sideways to browse. Cards without photos use a branded placeholder.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-white/15 text-white border-0 text-[11px] font-medium">{spotlightListings.length} listings</Badge>
                {spotlightLoading && (
                  <Badge className="bg-white/10 text-white/85 border border-white/10 text-[11px] font-medium">
                    Refreshing Zillow photos…
                  </Badge>
                )}
                {buyingPower.totalPower > 0 && (
                  <Badge className="bg-sky-400/20 text-sky-50 border border-sky-300/40 text-[11px] font-medium">
                    {curatedInBudgetCount} within {fmt(buyingPower.totalPower)} budget
                  </Badge>
                )}
              </div>
            </div>
            <CardContent className="p-0 sm:p-1">
              <div className="px-3 pb-4 pt-2 sm:px-4">
                <p className="mb-3 text-[11px] text-slate-500">
                  <span className="font-medium text-slate-600">Swipe or scroll</span> — select a home to analyze payment and DTI on the right.
                </p>
                <div
                  className="listing-carousel -mx-1 flex gap-4 overflow-x-auto px-1 pb-1 pt-0.5 scroll-smooth snap-x snap-mandatory"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {spotlightListings.map((l) => (
                    <div
                      key={l.id}
                      className="w-[min(100%,300px)] shrink-0 snap-start sm:w-[288px]"
                    >
                      <PropertyCard
                        listing={l}
                        maxLoan={buyingPower.maxLoan}
                        totalDPA={totalDPA}
                        buyingPower={buyingPower.totalPower}
                        onSelect={() => selectProperty(l)}
                        isSelected={selectedPropertyId === l.id}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-card lg:col-span-3">
          <CardContent className="p-0">
            {sel ? (
              (() => {
                const m = detailMort
                const affordable = sel.price <= buyingPower.totalPower
                const firstGenOk = sel.price <= 515200
                return (
                  <div className="space-y-0">
                    {sel.image ? (
                      <div className="h-52 bg-muted overflow-hidden">
                        <img src={sel.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold" style={{ color: 'var(--brand-navy)' }}>
                            {sel.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {sel.beds}bd {sel.baths}ba {sel.sqft?.toLocaleString()}sf · {sel.city}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold" style={{ color: 'var(--brand-navy)' }}>
                            {fmt(sel.price)}
                          </p>
                          {firstGenOk && (
                            <Badge className="text-[8px] bg-sky-50 text-sky-700 border border-sky-200">First-Gen Eligible</Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div
                          className="text-center p-3 rounded-xl"
                          style={{
                            background: m.bDTI <= 43 ? '#f0fdf4' : m.bDTI <= 50 ? '#fefce8' : '#fef2f2',
                          }}
                        >
                          <p
                            className="text-2xl font-bold"
                            style={{ color: m.bDTI <= 43 ? '#2d6a2e' : m.bDTI <= 50 ? '#d4a017' : '#dc2626' }}
                          >
                            {m.bDTI.toFixed(0)}%
                          </p>
                          <p className="text-[10px] text-muted-foreground">Back DTI</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-muted/50">
                          <p className="text-xl font-bold">{fmt(m.total)}</p>
                          <p className="text-[10px] text-muted-foreground">Monthly</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-muted/50">
                          <p className="text-xl font-bold" style={{ color: m.oop === 0 ? '#2d6a2e' : 'var(--brand-navy)' }}>
                            {fmt(m.oop)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Out of Pocket</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <Row l={`Down (${m.dpPct}%)`} v={fmt(m.dp)} />
                          <Row l="Closing (3%)" v={fmt(m.cc)} />
                          <Row l="DPA Applied" v={`(${fmt(totalDPA)})`} green />
                          <Row l="Your Cash" v={fmt(m.oop)} bold />
                        </div>
                        <div>
                          <Row l="P&I" v={fmt(m.pi)} />
                          <Row l="Tax + Ins + MIP" v={fmt(m.tax + m.ins + m.mip + m.pmi)} />
                          <Separator className="my-1" />
                          <Row l="Total" v={fmt(m.total)} bold />
                        </div>
                      </div>
                      {!affordable && (
                        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                          This home is over your buying power ({fmt(buyingPower.totalPower)}). Consider reducing debt or adding DPA.
                        </div>
                      )}
                      {sel.url ? (
                        <a href={sel.url} target="_blank" rel="noopener noreferrer">
                          <Button className="w-full brand-btn text-white">View Full Listing on Zillow ↗</Button>
                        </a>
                      ) : null}
                    </div>
                  </div>
                )
              })()
            ) : (
              <div className="flex items-center justify-center h-[500px] text-muted-foreground text-center px-8">
                <div>
                  <img src={logoImg} alt="" className="mx-auto w-16 opacity-20 mb-4" />
                  <p className="text-lg font-bold mb-1">Select a property to analyze</p>
                  <p className="text-sm">Click any listing or analyze a custom price.</p>
                  {buyingPower.totalPower > 0 && (
                    <p className="text-sm mt-2">
                      Your buying power:{' '}
                      <strong style={{ color: 'var(--brand-green)' }}>{fmt(buyingPower.totalPower)}</strong>
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

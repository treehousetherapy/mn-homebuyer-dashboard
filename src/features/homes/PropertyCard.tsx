import type { KeyboardEvent } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Listing } from '@/lib/types'
import { fmt, clamp } from '@/lib/calc'

function ListingMedia({ image, builder, city }: { image?: string; builder: string; city: string }) {
  const initial = builder.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'NH'
  return (
    <div className="relative h-44 w-full shrink-0 overflow-hidden bg-slate-100">
      {image ? (
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          loading="lazy"
        />
      ) : (
        <div className="listing-media-sample property-card-media-fallback relative flex h-full w-full flex-col items-center justify-center gap-1 p-4 text-center">
          <span className="absolute top-2 right-2 rounded bg-black/35 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/95 backdrop-blur-sm">
            No Zillow photo
          </span>
          <span className="text-3xl font-bold tracking-tight text-white">{initial}</span>
          <span className="text-[11px] font-medium text-white/85">{builder}</span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-white/55">{city}</span>
        </div>
      )}
    </div>
  )
}

export function PropertyCard({
  listing,
  maxLoan,
  totalDPA,
  buyingPower,
  onSelect,
  isSelected,
}: {
  listing: Listing
  maxLoan: number
  totalDPA: number
  buyingPower: number
  onSelect: () => void
  isSelected: boolean
}) {
  const affordable = listing.price <= buyingPower
  const withinDTI = listing.price <= maxLoan / (1 - 0.035)
  const reachWithDPA = !withinDTI && affordable
  const firstGenOk = listing.price <= 515200
  const matchPct = affordable
    ? clamp(Math.round((1 - listing.price / buyingPower) * 100 + 70), 50, 99)
    : clamp(Math.round((buyingPower / listing.price) * 80), 10, 49)
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect()
    }
  }

  return (
    <Card
      className={`dashboard-card group overflow-hidden transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d6a2e] focus-visible:ring-offset-2 ${
        isSelected ? 'ring-2 ring-[#2d6a2e] shadow-md' : 'hover:shadow-md hover:-translate-y-0.5'
      } ${!affordable ? 'opacity-65' : ''}`}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="button"
    >
      <ListingMedia image={listing.image} builder={listing.builder} city={listing.city} />
      <CardContent className="p-3.5 space-y-2 min-h-[7.5rem]">
        <div className="flex justify-between items-start gap-2">
          <p className="text-xl font-bold tabular-nums leading-none" style={{ color: 'var(--brand-navy)' }}>
            {fmt(listing.price)}
          </p>
          <div className="text-right shrink-0">
            <p
              className="text-sm font-bold tabular-nums"
              style={{
                color: matchPct >= 70 ? '#2d6a2e' : matchPct >= 50 ? '#d4a017' : '#dc2626',
              }}
            >
              {matchPct}%
            </p>
            <p className="text-[10px] text-muted-foreground">match</p>
          </div>
        </div>
        <p className="text-sm font-semibold leading-snug line-clamp-2">{listing.name}</p>
        <p className="text-xs text-muted-foreground">
          {listing.beds} bd · {listing.baths} ba · {listing.sqft.toLocaleString()} sf · {listing.city}
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {listing.builder && (
            <Badge variant="outline" className="text-[10px] py-0.5 h-5 font-normal">
              {listing.builder}
            </Badge>
          )}
          {firstGenOk && (
            <Badge className="text-[10px] py-0.5 h-5 bg-emerald-50 text-emerald-800 border border-emerald-200/80">
              First-Gen
            </Badge>
          )}
          {withinDTI && (
            <Badge className="text-[10px] py-0.5 h-5 bg-emerald-50 text-emerald-800 border border-emerald-200/80">
              In budget
            </Badge>
          )}
          {reachWithDPA && (
            <Badge className="text-[10px] py-0.5 h-5 bg-sky-50 text-sky-800 border border-sky-200/80">DPA reach</Badge>
          )}
          {!affordable && (
            <Badge className="text-[10px] py-0.5 h-5 bg-red-50 text-red-800 border border-red-200/80">Over</Badge>
          )}
        </div>
        {reachWithDPA && (
          <p className="text-[11px] text-sky-800 bg-sky-50/90 border border-sky-100 p-2 rounded-md leading-snug">
            Reachable with {fmt(totalDPA)} in selected DPA.
          </p>
        )}
        {!affordable && listing.price < buyingPower * 1.15 && (
          <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-100 p-2 rounded-md leading-snug">
            Tip: ~{fmt(Math.round((listing.price - buyingPower) * 0.006))}/mo less debt could qualify this price.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

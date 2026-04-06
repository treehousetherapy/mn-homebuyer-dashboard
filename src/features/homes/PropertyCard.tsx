import type { KeyboardEvent } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ImageOff } from 'lucide-react'
import type { Listing } from '@/lib/types'
import { fmt, clamp } from '@/lib/calc'

function ListingMedia({ image, builder, city }: { image?: string; builder: string; city: string }) {
  const initial = builder.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'NH'
  return (
    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-t-xl bg-slate-100">
      {image ? (
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
      ) : (
        <div className="listing-photo-placeholder relative flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-lg font-bold tracking-tight text-white shadow-inner backdrop-blur-[2px]"
              aria-hidden
            >
              {initial}
            </div>
            <div className="space-y-0.5">
              <p className="text-[13px] font-semibold leading-tight text-white/95">{builder}</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/50">{city}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-medium text-white/75 backdrop-blur-sm">
            <ImageOff className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
            Photo unavailable
          </div>
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

  const matchLabel =
    matchPct >= 80 ? 'Strong fit' : matchPct >= 65 ? 'Good fit' : matchPct >= 50 ? 'Moderate' : 'Stretch'

  return (
    <Card
      className={`group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d6a2e] focus-visible:ring-offset-2 ${
        isSelected
          ? 'ring-2 ring-[#2d6a2e] shadow-[0_8px_28px_-6px_rgba(45,106,46,0.35)]'
          : 'hover:border-slate-300/90 hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.12)] hover:-translate-y-px'
      } ${!affordable ? 'opacity-[0.72]' : ''}`}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${listing.name}, ${fmt(listing.price)}. ${matchLabel} ${matchPct}% match.`}
      aria-pressed={isSelected}
    >
      <ListingMedia image={listing.image} builder={listing.builder} city={listing.city} />
      <CardContent className="flex flex-1 flex-col gap-3 p-4 pt-3.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p
              className="font-display text-[1.35rem] font-bold leading-none tracking-tight tabular-nums"
              style={{ color: 'var(--brand-navy)' }}
            >
              {fmt(listing.price)}
            </p>
            {!affordable && (
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-red-600/90">Above buying power</p>
            )}
          </div>
          <div
            className={`shrink-0 rounded-lg px-2.5 py-1.5 text-right ${
              matchPct >= 70
                ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80'
                : matchPct >= 50
                  ? 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80'
                  : 'bg-red-50 text-red-800 ring-1 ring-red-200/80'
            }`}
          >
            <p className="text-base font-bold tabular-nums leading-none">{matchPct}%</p>
            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide opacity-80">{matchLabel}</p>
          </div>
        </div>

        <div className="min-h-0 space-y-1.5">
          <p className="text-[15px] font-semibold leading-snug text-slate-900 line-clamp-2">{listing.name}</p>
          <p className="text-[13px] text-slate-600">
            <span className="tabular-nums">{listing.beds}</span> bd
            <span className="mx-1 text-slate-300">·</span>
            <span className="tabular-nums">{listing.baths}</span> ba
            <span className="mx-1 text-slate-300">·</span>
            <span className="tabular-nums">{listing.sqft.toLocaleString()}</span> sq ft
          </p>
          <p className="text-xs font-medium text-slate-500">{listing.city}</p>
        </div>

        <div className="mt-auto flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
          {listing.builder && (
            <Badge variant="outline" className="border-slate-200/90 text-[10px] font-medium text-slate-700">
              {listing.builder}
            </Badge>
          )}
          {firstGenOk && (
            <Badge className="border border-emerald-200/80 bg-emerald-50/90 text-[10px] font-medium text-emerald-900">
              First-Gen
            </Badge>
          )}
          {withinDTI && (
            <Badge className="border border-emerald-200/80 bg-emerald-50/90 text-[10px] font-medium text-emerald-900">
              In budget
            </Badge>
          )}
          {reachWithDPA && (
            <Badge className="border border-sky-200/90 bg-sky-50 text-[10px] font-medium text-sky-900">DPA reach</Badge>
          )}
          {!affordable && (
            <Badge className="border border-red-200/90 bg-red-50 text-[10px] font-medium text-red-900">Over</Badge>
          )}
        </div>

        {reachWithDPA && (
          <p className="text-[11px] leading-snug text-sky-900 bg-sky-50/90 border border-sky-100/90 px-2.5 py-2 rounded-lg">
            Reachable with {fmt(totalDPA)} in selected DPA programs.
          </p>
        )}
        {!affordable && listing.price < buyingPower * 1.15 && (
          <p className="text-[11px] leading-snug text-amber-900 bg-amber-50 border border-amber-100 px-2.5 py-2 rounded-lg">
            Tip: ~{fmt(Math.round((listing.price - buyingPower) * 0.006))}/mo less debt could help qualify at this price.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

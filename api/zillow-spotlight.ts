import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = { runtime: 'nodejs' }

type SpotlightListing = {
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

const SPOTLIGHT_SEEDS: SpotlightListing[] = [
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

const ZILLOW_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
}

function extractImageUrl(html: string): string | undefined {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    /(https:\/\/photos\.zillowstatic\.com\/[^"'\\s>]+)/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return decodeHtml(match[1])
    if (match?.[0]?.startsWith('https://photos.zillowstatic.com/')) return decodeHtml(match[0])
  }

  return undefined
}

async function resolveListingImage(listing: SpotlightListing): Promise<SpotlightListing> {
  try {
    const response = await fetch(listing.url, { headers: ZILLOW_HEADERS })
    if (!response.ok) return listing

    const html = await response.text()
    const image = extractImageUrl(html)

    return image ? { ...listing, image } : listing
  } catch {
    return listing
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const resolved = await Promise.allSettled(SPOTLIGHT_SEEDS.map(resolveListingImage))
  const listings = resolved.map((result, index) =>
    result.status === 'fulfilled' ? result.value : SPOTLIGHT_SEEDS[index]
  )

  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400')
  return res.status(200).json({ listings })
}

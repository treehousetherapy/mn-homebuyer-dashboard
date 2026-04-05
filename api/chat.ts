import type { VercelRequest, VercelResponse } from '@vercel/node'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export const config = { runtime: 'nodejs' }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, buyerProfile } = req.body

  const firstGenStatus = buyerProfile?.isFirstGen
    ? 'qualifies for the First-Gen DPA (up to $35,000 forgivable, through MMCDC)'
    : 'does not meet the first-generation homebuyer definition'

  const systemPrompt = `You are a friendly, plain-language Minnesota homebuying coach for first-generation buyers.

User's current profile:
- Annual income: $${buyerProfile?.annualIncome?.toLocaleString() ?? 'unknown'}
- Credit score: ${buyerProfile?.creditScore ?? 'unknown'}
- First-gen status: ${firstGenStatus}
- Target area: ${buyerProfile?.targetCity || 'Minnesota (general)'}
- Monthly debt: $${buyerProfile?.monthlyDebt ?? 0}

Key MN programs to reference when relevant:
- Minnesota Housing Start Up: 30-yr fixed, income/purchase price limits by county
- Minnesota Housing Step Up: for move-up buyers
- First-Gen DPA Fund (MMCDC): up to $35,000 forgivable, portal status currently unknown
- MN Mortgage Credit Certificate (MCC): federal tax credit up to $2,000/yr
- Dakota County CDA, Scott County CDA, Lakeville programs for South Metro buyers

Rules:
- Always recommend working with a HUD-approved housing counselor (framework.org or 651-659-9336)
- Never give specific legal or financial advice — guide and educate only
- Keep answers concise (under 150 words) unless the user asks for detail
- If unsure about a program detail, say so and point to mnhousing.gov
- Be warm and encouraging — many first-gen buyers feel intimidated`

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages,
  })

  result.pipeDataStreamToResponse(res)
}

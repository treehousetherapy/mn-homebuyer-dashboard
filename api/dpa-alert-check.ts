import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const config = { runtime: 'nodejs' }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Protect from unauthorized calls (Vercel sends this header for crons)
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Flip DPA_PORTAL_STATUS to "OPEN" in Vercel env vars when portal opens
  const DPA_PORTAL_OPEN = process.env.DPA_PORTAL_STATUS === 'OPEN'

  if (!DPA_PORTAL_OPEN) {
    return res.status(200).json({ message: 'Portal still closed — no emails sent.' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // server-side only — never expose to client
  )
  const resend = new Resend(process.env.RESEND_API_KEY!)

  const { data: waitlist, error } = await supabase
    .from('dpa_waitlist')
    .select('email')
    .eq('notified', false)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  const emails = waitlist ?? []
  let sent = 0

  for (const user of emails) {
    const { error: emailError } = await resend.emails.send({
      from: 'alerts@mnhomebuyerguide.com',
      to: user.email,
      subject: '🏠 MN First-Gen DPA Portal Is NOW OPEN — Apply Today',
      html: `
        <h2>The Minnesota First-Generation Down Payment Assistance portal is open!</h2>
        <p>Funds are limited and historically run out within days. Act now:</p>
        <ul>
          <li><strong>Step 1:</strong> Visit <a href="https://www.mmcdc.com">mmcdc.com</a> to start your application</li>
          <li><strong>Step 2:</strong> Have your income verification, tax returns, and first-gen documentation ready</li>
          <li><strong>Step 3:</strong> Contact a HUD-approved housing counselor if you need help</li>
        </ul>
        <p>Up to $35,000 in forgivable down payment assistance is available.</p>
        <p style="color:#666;font-size:12px">You're receiving this because you signed up for DPA alerts at mnhomebuyerguide.com</p>
      `
    })

    if (!emailError) {
      sent++
      // Mark as notified so we don't double-email
      await supabase
        .from('dpa_waitlist')
        .update({ notified: true })
        .eq('email', user.email)
    }
  }

  return res.status(200).json({ sent, total: emails.length })
}

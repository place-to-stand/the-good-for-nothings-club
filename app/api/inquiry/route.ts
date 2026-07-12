import { checkBotId } from 'botid/server'
import { Resend } from 'resend'

import { inquirySchema } from '@/data/schemas'
import { saveInquiry } from '@/lib/inquiries'

const resend = new Resend(process.env.RESEND_API_KEY)

const SUBJECT_PREFIX: Record<string, string> = {
  facility: 'Facility booking inquiry',
  service: 'Service inquiry',
  membership: 'Membership application',
  event: 'Event RSVP',
  general: 'Contact form',
}

export async function POST(request: Request) {
  const verification = await checkBotId()
  if (verification.isBot) {
    return Response.json({ error: 'Access denied' }, { status: 403 })
  }

  const body = await request.json()

  const parsed = inquirySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const inquiry = parsed.data
  const persisted = await saveInquiry(inquiry)

  const { error } = await resend.emails.send({
    from: 'GFNC Website <no-reply@updates.thegoodfornothings.club>',
    to: ['hello@thegoodfornothings.club'],
    replyTo: inquiry.email,
    subject: `${SUBJECT_PREFIX[inquiry.kind]}: ${inquiry.item}`,
    text: [
      `Kind: ${inquiry.kind}`,
      `Item: ${inquiry.item}`,
      `Offering: ${inquiry.offering || '-'}`,
      `Name: ${inquiry.name}`,
      `Email: ${inquiry.email}`,
      `Phone: ${inquiry.phone || '-'}`,
      `Socials: ${inquiry.socials?.length ? inquiry.socials.join(', ') : '-'}`,
      `Portfolio: ${inquiry.portfolio || '-'}`,
      `References available: ${inquiry.references || '-'}`,
      '',
      inquiry.message || '(no message)',
      '',
      persisted
        ? 'Saved to inquiries table.'
        : 'NOT saved to database - this email is the only record.',
    ].join('\n'),
  })

  if (error) {
    // The DB may still have it; only fail the request if nothing recorded it.
    if (!persisted) {
      return Response.json({ error }, { status: 500 })
    }
    console.error('Inquiry email failed (record persisted):', error)
  }

  return Response.json({ success: true })
}

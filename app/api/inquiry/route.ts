import { checkBotId } from 'botid/server'
import { Resend } from 'resend'

import { inquirySchema } from '@/data/schemas'
import { inquiryEmail } from '@/lib/emailTemplates'
import { saveInquiry } from '@/lib/inquiries'
import { addToMailingList } from '@/lib/newsletter'

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

  // Opt-in only; a subscription failure must never fail the inquiry.
  if (inquiry.mailingList) {
    try {
      const { error } = await addToMailingList(inquiry.email)
      if (error) console.error('Mailing list opt-in failed:', error)
    } catch (error) {
      console.error('Mailing list opt-in failed:', error)
    }
  }

  const { html, text } = inquiryEmail(inquiry, persisted)

  const { error } = await resend.emails.send({
    from: 'GFNC Website <no-reply@updates.thegoodfornothings.club>',
    to: ['hello@thegoodfornothings.club'],
    replyTo: inquiry.email,
    subject: `${SUBJECT_PREFIX[inquiry.kind]}: ${inquiry.item}`,
    html,
    text,
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

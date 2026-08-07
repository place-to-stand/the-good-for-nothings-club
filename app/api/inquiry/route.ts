import { checkBotId } from 'botid/server'
import { Resend } from 'resend'

import { inquirySchema } from '@/data/schemas'
import { confirmationEmail, inquiryEmail } from '@/lib/emailTemplates'
import { saveInquiry } from '@/lib/inquiries'
import { addToMailingList } from '@/lib/newsletter'
import { captureServerException } from '@/lib/posthog-server'

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
      if (error) {
        console.error('Mailing list opt-in failed:', error)
        await captureServerException(new Error(`Mailing list opt-in failed: ${error.message}`), { context: 'inquiry mailingList' })
      }
    } catch (error) {
      console.error('Mailing list opt-in failed:', error)
      await captureServerException(error, { context: 'inquiry mailingList' })
    }
  }

  const { html, text } = inquiryEmail(inquiry, persisted)

  const { error } = await resend.emails.send({
    from: 'GFNC Website <hello@send.thegoodfornothings.club>',
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

  // Receipt to the submitter; a failure here must never fail the inquiry.
  try {
    const confirmation = confirmationEmail(inquiry)
    const { error: confirmationError } = await resend.emails.send({
      from: 'The Good For Nothings Club <hello@send.thegoodfornothings.club>',
      to: [inquiry.email],
      replyTo: 'hello@thegoodfornothings.club',
      subject: confirmation.subject,
      html: confirmation.html,
      text: confirmation.text,
    })
    if (confirmationError) {
      console.error('Confirmation email failed:', confirmationError)
      await captureServerException(
        new Error(`Confirmation email failed: ${confirmationError.message}`),
        { context: 'inquiry confirmation' }
      )
    }
  } catch (error) {
    console.error('Confirmation email failed:', error)
    await captureServerException(error, { context: 'inquiry confirmation' })
  }

  return Response.json({ success: true })
}

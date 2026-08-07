import { checkBotId } from 'botid/server'
import { Resend } from 'resend'

import { newsletterSignUpSchema } from '@/data/schemas'
import { newsletterConfirmationEmail, newsletterEmail } from '@/lib/emailTemplates'
import { addToMailingList } from '@/lib/newsletter'
import { captureServerException } from '@/lib/posthog-server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const verification = await checkBotId()
  if (verification.isBot) {
    return Response.json({ error: 'Access denied' }, { status: 403 })
  }

  const body = await request.json()

  try {
    newsletterSignUpSchema.parse(body)
  } catch (error) {
    return Response.json(
      { error },
      {
        status: 400,
      }
    )
  }

  const { error } = await addToMailingList(body.email)

  if (error) {
    return Response.json(
      { error },
      {
        status: 400,
      }
    )
  }

  const { html, text } = newsletterEmail(body.email)

  resend.emails.send({
    from: `GFNC Newsletter Sign Up Form <hello@send.thegoodfornothings.club>`,
    to: ['hello@thegoodfornothings.club'],
    replyTo: body.email,
    subject: 'Newsletter Sign up @ https://thegoodfornothings.club/',
    html,
    text,
  })

  // Receipt to the subscriber; a failure here must never fail the sign-up.
  try {
    const confirmation = newsletterConfirmationEmail()
    const { error: confirmationError } = await resend.emails.send({
      from: 'The Good For Nothings Club <hello@send.thegoodfornothings.club>',
      to: [body.email],
      replyTo: 'hello@thegoodfornothings.club',
      subject: confirmation.subject,
      html: confirmation.html,
      text: confirmation.text,
    })
    if (confirmationError) {
      console.error('Newsletter confirmation email failed:', confirmationError)
      await captureServerException(
        new Error(
          `Newsletter confirmation email failed: ${confirmationError.message}`
        ),
        { context: 'newsletter confirmation' }
      )
    }
  } catch (error) {
    console.error('Newsletter confirmation email failed:', error)
    await captureServerException(error, { context: 'newsletter confirmation' })
  }

  return Response.json({ success: true })
}

import { checkBotId } from 'botid/server'
import { Resend } from 'resend'

import { newsletterSignUpSchema } from '@/data/schemas'
import { newsletterEmail } from '@/lib/emailTemplates'
import { addToMailingList } from '@/lib/newsletter'

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
    from: `GFNC Newsletter Sign Up Form <no-reply@updates.thegoodfornothings.club>`,
    to: ['hello@thegoodfornothings.club'],
    subject: 'Newsletter Sign up @ https://www.thegoodfornothings.club/',
    html,
    text,
  })

  return Response.json({ success: true })
}

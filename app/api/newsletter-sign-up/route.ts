import { checkBotId } from 'botid/server'
import { Resend } from 'resend'

import { newsletterSignUpSchema } from '@/data/schemas'

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

  const { error } = await resend.contacts.create({
    email: body.email,
    unsubscribed: false,
    audienceId: '0e260e13-cbce-463c-963e-258ca972c31b',
  })

  if (error) {
    return Response.json(
      { error },
      {
        status: 400,
      }
    )
  }

  resend.emails.send({
    from: `GFNC Newsletter Sign Up Form <no-reply@updates.thegoodfornothings.club>`,
    to: ['hello@thegoodfornothings.club'],
    subject: 'Newsletter Sign up @ https://www.thegoodfornothings.club/',
    text: `You just got a new mailing list sign up!\n\nEmail: ${body.email}`,
  })

  return Response.json({ success: true })
}

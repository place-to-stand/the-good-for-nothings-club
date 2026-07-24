import { Resend } from 'resend'

/**
 * The club's one mailing list: a Resend audience fed by the footer
 * newsletter form and the opt-in checkbox on the inquiry and
 * membership forms. Resend upserts by email, so repeat signups are safe.
 */
const NEWSLETTER_AUDIENCE_ID = '0e260e13-cbce-463c-963e-258ca972c31b'

export function addToMailingList(email: string) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  return resend.contacts.create({
    email,
    unsubscribed: false,
    audienceId: NEWSLETTER_AUDIENCE_ID,
  })
}

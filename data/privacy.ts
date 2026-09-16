/**
 * Privacy policy - plain, version-controlled copy. Edit directly.
 *
 * Rendered as HTML by app/privacy/page.tsx and as markdown by
 * lib/markdown/pages.ts, so one edit updates both. Keep every statement
 * true to what the code does: forms (app/api/inquiry, newsletter-sign-up),
 * analytics (instrumentation-client.ts, app/layout.tsx), and embeds.
 * Bump `updated` when the substance changes.
 */

export type PrivacySection = {
  title: string
  /** Paragraphs. Plain text - no markup. */
  paragraphs: string[]
  /** Optional bullet list rendered after the paragraphs. */
  points?: string[]
}

export const privacyCopy = {
  title: 'Privacy',
  lead: 'What this site collects, why, and how to reach us about it.',
  updated: '2026-09-16',
  operator: 'The Good for Nothings Club LLC',
  email: 'hello@thegoodfornothings.club',
}

export const privacySections: PrivacySection[] = [
  {
    title: 'Who we are',
    paragraphs: [
      'The Good for Nothings Club LLC runs thegoodfornothings.club and the clubhouse at 1800 W Koenig Ln, Austin, TX 78756. This page explains what information the site collects, what we do with it, and who else handles it. Questions about any of it go to hello@thegoodfornothings.club.',
    ],
  },
  {
    title: 'What you send us',
    paragraphs: [
      'The site has four kinds of forms: the contact form, membership applications, event RSVPs, and facility or service inquiries. Depending on the form, we ask for your name, email address, phone number, social handles, a portfolio link, a message, how you heard about us, and the tier, room, service, or event you are asking about. We only collect what you type in.',
      'Each submission is emailed to hello@thegoodfornothings.club and, when our database is connected, saved to our inquiries table so the founding members can follow up, schedule tours, and manage the membership waitlist. We keep it as long as we need it to answer you and to run the club.',
    ],
    points: [
      'We also record where your visit came from: the referring site, any utm_source, utm_medium, and utm_campaign tags in the link you clicked, and the first page you landed on. This is stored in your browser for the visit and attached to a form only if you submit one.',
      'The forms use Vercel BotID, an invisible check that helps us tell people from automated spam. It does not show a puzzle and does not build a profile of you.',
    ],
  },
  {
    title: 'Newsletter',
    paragraphs: [
      'If you sign up for the newsletter in the footer, or tick the mailing-list box on a form, we add your email address to our list at Resend, the service that sends our email. You get a confirmation message right away. We send occasional updates about events, openings, and new work. To leave the list, use the unsubscribe link in any newsletter or email hello@thegoodfornothings.club and we will remove you.',
    ],
  },
  {
    title: 'Analytics and cookies',
    paragraphs: [
      'We want to know which pages people read and where the site breaks. For that we use three tools. None of them is used to sell or show you ads.',
    ],
    points: [
      'PostHog records page views, clicks on forms, and errors the site throws in your browser. Requests go through our own domain and PostHog stores the data in the United States. It sets cookies and browser storage so it can tell one visit from the next.',
      'Google Analytics counts visits and traffic sources. It sets its own cookies and is governed by Google’s privacy policy.',
      'Vercel Web Analytics counts page views without cookies or cross-site identifiers.',
    ],
  },
  {
    title: 'Third-party content',
    paragraphs: [
      'Some pages load content from other companies, and those companies can see your IP address and may set their own cookies when the content loads. The home page shows our Instagram feed through Behold and an embedded Spotify playlist. The contact page shows a Google Map. Project pages may embed video from YouTube or Vimeo, audio from Spotify, and photos from our Convex file storage. Our shop at shop.thegoodfornothings.club runs on Shopify and has its own policies.',
    ],
  },
  {
    title: 'Who handles your data',
    paragraphs: [
      'We do not sell your information. The following companies process it on our behalf to keep the site running: Vercel (hosting, bot detection, and web analytics), Convex (our database and file storage), Resend (email delivery and the newsletter list), PostHog (analytics and error tracking), and Google (analytics and maps). Each one only gets what it needs for its job.',
    ],
  },
  {
    title: 'Your choices',
    paragraphs: [
      'You can browse the whole site without filling in a form. You can block or clear cookies in your browser; the site still works, though analytics will be less accurate. To see, correct, or delete anything you have sent us, or to be taken off the waitlist or newsletter, email hello@thegoodfornothings.club from the address you used and we will take care of it.',
    ],
  },
  {
    title: 'Changes',
    paragraphs: [
      'When this policy changes we update this page and the date at the top. Substantive changes to how we use your data will also go out in the newsletter.',
    ],
  },
]

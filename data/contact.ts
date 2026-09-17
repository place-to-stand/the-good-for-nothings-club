/**
 * Contact page copy. Plain, version-controlled data (no CMS). Edit directly.
 *
 * Read by app/contact/page.tsx (HTML) and lib/markdown/pages.ts (markdown).
 * `agentNote` is the markdown view's stand-in for the form, which needs a
 * browser (Vercel BotID). It is the one line the two views do not share,
 * and it lives here so that difference is deliberate and in one place.
 */
export const contactCopy = {
  lead: 'Say hello, ask a question, or start something.',
  emailTitle: 'Email',
  socialTitle: 'Social',
  locationTitle: 'Location',
  formTitle: 'Send a message',
  agentNote:
    'The contact form needs a browser (it runs a bot check). Automated clients should email us instead, with a name, a reply address, and what the message is about.',
}

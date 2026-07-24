import type { Inquiry } from '@/data/schemas'

/**
 * Branded HTML bodies for the notification emails, in the site's visual
 * language: lavender ground, white card with a heavy black border, bold
 * uppercase labels. Table-and-inline-style markup only, so it renders in
 * email clients. Every message keeps a plain-text fallback.
 */

const LAVENDER = '#dac8f9'
const SANS = "Helvetica, Arial, sans-serif"

/** All user-supplied strings pass through here before touching HTML. */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function fieldRow(label: string, valueHtml: string): string {
  return `
    <tr>
      <td style="padding:6px 0;vertical-align:top;white-space:nowrap;font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#000;width:140px;">${label}</td>
      <td style="padding:6px 0 6px 16px;vertical-align:top;font-family:${SANS};font-size:14px;color:#000;word-break:break-word;">${valueHtml}</td>
    </tr>`
}

/** Shared black masthead + white card shell around `bodyHtml`. */
function shell(headerLabel: string, bodyHtml: string, footnote?: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:${LAVENDER};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${LAVENDER};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background-color:#000;padding:14px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:${SANS};font-size:20px;font-weight:900;letter-spacing:2px;color:#fff;">GFNC</td>
                  <td align="right" style="font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${LAVENDER};">${headerLabel}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#fff;border:2px solid #000;border-top:0;padding:24px 20px;">
              ${bodyHtml}
            </td>
          </tr>
          ${
            footnote
              ? `<tr><td style="padding:14px 4px;font-family:${SANS};font-size:12px;color:#000;">${footnote}</td></tr>`
              : ''
          }
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** "utm_source / utm_medium / utm_campaign", else the referrer, else direct. */
function sourceLabel(attribution: Inquiry['attribution']): string {
  if (attribution?.utmSource) {
    return [attribution.utmSource, attribution.utmMedium, attribution.utmCampaign]
      .filter(Boolean)
      .join(' / ')
  }
  return attribution?.referrer || 'direct'
}

export function inquiryEmail(
  inquiry: Inquiry,
  persisted: boolean
): { html: string; text: string } {
  const source = sourceLabel(inquiry.attribution)

  const rows = [
    fieldRow('Name', escapeHtml(inquiry.name)),
    fieldRow(
      'Email',
      `<a href="mailto:${escapeHtml(inquiry.email)}" style="color:#000;">${escapeHtml(inquiry.email)}</a>`
    ),
    inquiry.phone && fieldRow('Phone', escapeHtml(inquiry.phone)),
    inquiry.socials?.length &&
      fieldRow('Socials', inquiry.socials.map(escapeHtml).join('<br>')),
    inquiry.portfolio && fieldRow('Portfolio', escapeHtml(inquiry.portfolio)),
    inquiry.references && fieldRow('References', escapeHtml(inquiry.references)),
    inquiry.referralSource &&
      fieldRow('Heard via', escapeHtml(inquiry.referralSource)),
    inquiry.mailingList &&
      fieldRow('Mailing list', '<strong>Opted in</strong>'),
    fieldRow('Source', escapeHtml(source)),
    inquiry.attribution?.landingPage &&
      fieldRow('Landed on', escapeHtml(inquiry.attribution.landingPage)),
  ]
    .filter(Boolean)
    .join('')

  const body = `
    <div style="font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#000;">${escapeHtml(inquiry.kind)}</div>
    <div style="font-family:${SANS};font-size:22px;font-weight:900;color:#000;padding:4px 0 2px;">${escapeHtml(inquiry.item)}</div>
    ${inquiry.offering ? `<div style="font-family:${SANS};font-size:14px;color:#000;">${escapeHtml(inquiry.offering)}</div>` : ''}
    <div style="border-top:2px solid #000;margin:16px 0;"></div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    ${
      inquiry.message
        ? `<div style="margin-top:16px;padding:12px 16px;background-color:${LAVENDER};border-left:3px solid #000;font-family:${SANS};font-size:14px;line-height:1.5;color:#000;white-space:pre-wrap;">${escapeHtml(inquiry.message)}</div>`
        : ''
    }
    ${
      persisted
        ? `<div style="margin-top:18px;font-family:${SANS};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#4d4d4d;">Saved to the inquiries table</div>`
        : `<div style="margin-top:18px;padding:10px 14px;background-color:#000;font-family:${SANS};font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#fff;">Not saved to the database — this email is the only record</div>`
    }`

  const html = shell(
    'Website inquiry',
    body,
    `Reply to this email to reach ${escapeHtml(inquiry.name)} directly.`
  )

  // The fallback record; keeps every field so nothing is lost to a client
  // that strips HTML.
  const text = [
    `Kind: ${inquiry.kind}`,
    `Item: ${inquiry.item}`,
    `Offering: ${inquiry.offering || '-'}`,
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Phone: ${inquiry.phone || '-'}`,
    `Socials: ${inquiry.socials?.length ? inquiry.socials.join(', ') : '-'}`,
    `Portfolio: ${inquiry.portfolio || '-'}`,
    `References available: ${inquiry.references || '-'}`,
    `Heard about us via: ${inquiry.referralSource || '-'}`,
    `Mailing list: ${inquiry.mailingList ? 'opted in' : '-'}`,
    `Source: ${source}`,
    `Landing page: ${inquiry.attribution?.landingPage || '-'}`,
    '',
    inquiry.message || '(no message)',
    '',
    persisted
      ? 'Saved to inquiries table.'
      : 'NOT saved to database - this email is the only record.',
  ].join('\n')

  return { html, text }
}

export function newsletterEmail(email: string): { html: string; text: string } {
  const body = `
    <div style="font-family:${SANS};font-size:22px;font-weight:900;color:#000;">New mailing list sign-up</div>
    <div style="border-top:2px solid #000;margin:16px 0;"></div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${fieldRow('Email', `<a href="mailto:${escapeHtml(email)}" style="color:#000;">${escapeHtml(email)}</a>`)}
    </table>`

  const html = shell('Newsletter', body)
  const text = `You just got a new mailing list sign up!\n\nEmail: ${email}`

  return { html, text }
}

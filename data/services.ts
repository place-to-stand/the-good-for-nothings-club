/**
 * Services — the work our members can take on for clients.
 *
 * Plain, version-controlled data (no CMS). Edit directly. `slug` must be
 * URL-safe and unique; it's used for anchors and as the inquiry subject.
 */

export type Service = {
  /** URL-safe unique id. Used for anchor links + inquiry subject. */
  slug: string
  name: string
  /** One-line summary shown under the name. */
  summary: string
  /** Longer description. Each string renders as its own paragraph. */
  description: string[]
  /** What a client actually gets — deliverables, skills, formats. */
  deliverables: string[]
  /** Optional human-readable starting price, e.g. "From $500". */
  startingPrice?: string
  /** Show an "Inquire" button for this service. Defaults to true. */
  inquiryEnabled?: boolean
}

export const services: Service[] = [
  {
    slug: 'web-app-development',
    name: 'Web & App Development',
    summary: 'Sites, web apps, and tools built by working engineers.',
    description: [
      'From marketing sites to full product builds, our members ship modern, maintainable web and app experiences.',
    ],
    deliverables: [
      'Marketing & brand websites',
      'Web applications & internal tools',
      'E-commerce storefronts',
      'Ongoing maintenance & support',
    ],
    startingPrice: 'From $1,500',
    inquiryEnabled: true,
  },
  {
    slug: 'video-production',
    name: 'Video Production',
    summary: 'Concept to final cut — films, promos, and social content.',
    description: [
      'Our filmmakers handle the full pipeline: pre-production, shooting, and post — for brand films, music videos, event coverage, and short-form social.',
    ],
    deliverables: [
      'Brand & promo films',
      'Music videos',
      'Event coverage',
      'Short-form social content',
    ],
    startingPrice: 'From $1,000',
    inquiryEnabled: true,
  },
  {
    slug: 'photography',
    name: 'Photography',
    summary: 'Product, portrait, and event photography.',
    description: [
      'Clean, considered photography for products, people, and events — shot in our studio or on location.',
    ],
    deliverables: [
      'Product & e-commerce photography',
      'Portraits & headshots',
      'Event photography',
      'Edited, ready-to-use galleries',
    ],
    startingPrice: 'From $400',
    inquiryEnabled: true,
  },
  {
    slug: 'audio-music',
    name: 'Audio & Music',
    summary: 'Recording, production, mixing, and sound design.',
    description: [
      'Our musicians and engineers cover recording, production, mixing, and sound design for music, podcasts, and media.',
    ],
    deliverables: [
      'Recording & production',
      'Mixing & mastering',
      'Podcast editing',
      'Sound design for video',
    ],
    startingPrice: 'From $300',
    inquiryEnabled: true,
  },
  {
    slug: 'design-branding',
    name: 'Design & Branding',
    summary: 'Identity, graphics, and design systems.',
    description: [
      'Brand identities, graphic design, and design systems that hold up across everything you make.',
    ],
    deliverables: [
      'Logos & brand identity',
      'Graphic & print design',
      'Design systems',
      'Marketing collateral',
    ],
    startingPrice: 'From $500',
    inquiryEnabled: true,
  },
]

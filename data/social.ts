/**
 * Canonical club profiles. Rendered as icons by
 * components/SocialMediaLinks.tsx, listed as sameAs in lib/structuredData.ts,
 * and linked from the markdown/llms.txt views. Kept free of React imports so
 * server code and tests can read it directly.
 */
export const SOCIAL_PROFILES = [
  { href: 'https://www.instagram.com/thegfnc/', label: 'Instagram' },
  { href: 'https://www.threads.com/@thegfnc', label: 'Threads' },
  { href: 'https://www.tiktok.com/@thegfnc', label: 'TikTok' },
  {
    href: 'https://open.spotify.com/user/31l4gvropwokzlmzymegi3vqa7py?si=c5fce32011494e91',
    label: 'Spotify',
  },
  { href: 'https://github.com/thegfnc', label: 'GitHub' },
] as const

export type SocialLabel = (typeof SOCIAL_PROFILES)[number]['label']

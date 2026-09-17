import Link from 'next/link'
import {
  FaGithub,
  FaInstagram,
  FaSpotify,
  FaTiktok,
  FaThreads,
} from 'react-icons/fa6'
import type { IconType } from 'react-icons'

import { SOCIAL_PROFILES, type SocialLabel } from '@/data/social'

const ICONS: Record<SocialLabel, IconType> = {
  Instagram: FaInstagram,
  Threads: FaThreads,
  TikTok: FaTiktok,
  Spotify: FaSpotify,
  GitHub: FaGithub,
}

/** Canonical club profiles (data/social.ts) paired with their icons. */
export const SOCIAL_LINKS = SOCIAL_PROFILES.map(profile => ({
  ...profile,
  Icon: ICONS[profile.label],
}))

export default function SocialMediaLinks() {
  return (
    <div className='flex gap-4'>
      {SOCIAL_LINKS.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          aria-label={label}
          className='transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-125 odd:hover:-rotate-12 even:hover:rotate-12 active:translate-y-0 active:scale-95'
        >
          <Icon />
        </Link>
      ))}
    </div>
  )
}

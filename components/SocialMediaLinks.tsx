import Link from 'next/link'
import {
  FaGithub,
  FaInstagram,
  FaSpotify,
  FaTiktok,
  FaThreads,
} from 'react-icons/fa6'

const SOCIAL_LINKS = [
  {
    href: 'https://www.instagram.com/thegfnc/',
    label: 'Instagram',
    Icon: FaInstagram,
  },
  {
    href: 'https://www.threads.com/@thegfnc',
    label: 'Threads',
    Icon: FaThreads,
  },
  {
    href: 'https://www.tiktok.com/@thegfnc',
    label: 'TikTok',
    Icon: FaTiktok,
  },
  {
    href: 'https://open.spotify.com/user/31l4gvropwokzlmzymegi3vqa7py?si=c5fce32011494e91',
    label: 'Spotify',
    Icon: FaSpotify,
  },
  {
    href: 'https://github.com/thegfnc',
    label: 'GitHub',
    Icon: FaGithub,
  },
]

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
          className='transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-125 active:translate-y-0 active:scale-95 odd:hover:-rotate-12 even:hover:rotate-12'
        >
          <Icon />
        </Link>
      ))}
    </div>
  )
}

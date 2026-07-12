'use client'

import { useAuthActions } from '@convex-dev/auth/react'
import { Authenticated } from 'convex/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/inquiries', label: 'Inquiries' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/members', label: 'Members' },
  { href: '/admin/media', label: 'Media' },
]

/** Same pill-menu pattern as the projects type filter. */
export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuthActions()

  return (
    <Authenticated>
      <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-4 pt-4'>
        <ul className='flex max-w-full overflow-x-auto rounded-full border-2 border-black'>
          {links.map(link => (
            <li key={link.href}>
              <Link
                className={cn(
                  'block px-4 py-2.5 font-sans text-sm leading-tight font-black uppercase transition-colors hover:no-underline sm:px-6',
                  pathname === link.href
                    ? 'bg-black text-white hover:bg-black'
                    : 'text-black hover:bg-black/10 active:bg-black/20'
                )}
                href={link.href}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <button
          type='button'
          onClick={async () => {
            await signOut()
            router.push('/admin/login')
          }}
          className='font-sans text-sm font-bold uppercase underline-offset-2 hover:underline'
        >
          Sign out
        </button>
      </div>
    </Authenticated>
  )
}

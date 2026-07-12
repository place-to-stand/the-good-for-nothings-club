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

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuthActions()

  return (
    <Authenticated>
      <nav className='flex flex-wrap items-center gap-x-6 gap-y-2 border-b-2 border-black pb-4'>
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'font-sans text-sm uppercase tracking-[1px] hover:underline',
              pathname === link.href && 'font-bold underline'
            )}
          >
            {link.label}
          </Link>
        ))}
        <button
          type='button'
          onClick={async () => {
            await signOut()
            router.push('/admin/login')
          }}
          className='ml-auto font-sans text-sm uppercase tracking-[1px] text-black/60 hover:text-black hover:underline'
        >
          Sign out
        </button>
      </nav>
    </Authenticated>
  )
}

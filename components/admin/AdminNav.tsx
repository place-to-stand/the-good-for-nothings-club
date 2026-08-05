'use client'

import { useAuthActions } from '@convex-dev/auth/react'
import { Authenticated, useQuery } from 'convex/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { api } from '@/convex/_generated/api'
import type { Pipeline } from '@/data/schemas'
import { cn } from '@/lib/utils'

const inquiryLinks: { href: string; label: string; board: Pipeline }[] = [
  { href: '/admin/inquiries/membership', label: 'Membership', board: 'membership' },
  { href: '/admin/inquiries/services', label: 'Services', board: 'services' },
  { href: '/admin/inquiries/inbox', label: 'Inbox', board: 'inbox' },
]

const cmsLinks = [
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/members', label: 'Members' },
  { href: '/admin/media', label: 'Media' },
]

/**
 * A labeled cluster of links: quiet uppercase micro-label above the group.
 * On mobile everything stays one flat scrollable row.
 */
function NavGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='contents md:block'>
      <div className='hidden px-3 pt-7 pb-1 font-sans text-[10px] font-semibold uppercase tracking-[1px] text-black/30 md:block'>
        {label}
      </div>
      <div className='contents md:flex md:flex-col md:gap-0.5'>{children}</div>
    </div>
  )
}

/**
 * Left sidebar on desktop, horizontal scroller on mobile. Hidden entirely
 * when signed out, so the login page gets the full card width.
 */
export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuthActions()
  // Active-count badges for the inquiry boards; shared cache with the pages.
  const summary = useQuery(api.admin.pipelineSummary, {})

  const linkClassName = (active: boolean) =>
    cn(
      'flex items-center gap-2 whitespace-nowrap px-3 py-2 font-sans text-sm leading-tight font-medium uppercase transition-colors hover:no-underline',
      active
        ? 'bg-black text-white hover:bg-black'
        : 'text-black hover:bg-black/10 active:bg-black/20'
    )

  const badge = (count: number | undefined, active: boolean) =>
    count !== undefined &&
    count > 0 && (
      <span
        className={cn(
          'ml-auto px-1.5 py-0.5 font-sans text-[10px] leading-none font-bold',
          active ? 'bg-white text-black' : 'bg-black text-white'
        )}
      >
        {count}
      </span>
    )

  return (
    <Authenticated>
      <aside className='shrink-0 border-b-2 border-black md:w-48 md:border-r-2 md:border-b-0'>
        <div className='flex items-center gap-1 overflow-x-auto px-2 py-2 md:sticky md:top-4 md:flex-col md:items-stretch md:gap-0 md:px-3 md:py-3'>
          <Link
            className={linkClassName(pathname === '/admin')}
            href='/admin'
          >
            Dashboard
          </Link>
          <NavGroup label='Inquiries'>
            {inquiryLinks.map(link => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  className={linkClassName(active)}
                  href={link.href}
                >
                  {link.label}
                  {badge(summary?.boards[link.board].active, active)}
                </Link>
              )
            })}
          </NavGroup>
          <NavGroup label='CMS'>
            {cmsLinks.map(link => (
              <Link
                key={link.href}
                className={linkClassName(pathname === link.href)}
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </NavGroup>
          <div className='md:mt-3 md:border-t-2 md:border-black/10 md:pt-3 md:pb-2'>
            <button
              type='button'
              onClick={async () => {
                await signOut()
                router.push('/admin/login')
              }}
              className='block w-full whitespace-nowrap px-3 py-2 text-left font-sans text-sm leading-tight font-medium text-black/60 uppercase transition-colors hover:bg-black/10 hover:text-black active:bg-black/20'
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </Authenticated>
  )
}

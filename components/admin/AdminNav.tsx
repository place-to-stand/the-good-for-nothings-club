'use client'

import { useAuthActions } from '@convex-dev/auth/react'
import { Authenticated, useQuery } from 'convex/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { api } from '@/convex/_generated/api'
import type { Pipeline } from '@/data/schemas'
import { cn } from '@/lib/utils'

const inquiryLinks: { href: string; label: string; board: Pipeline }[] = [
  {
    href: '/admin/inquiries/membership',
    label: 'Membership',
    board: 'membership',
  },
  { href: '/admin/inquiries/services', label: 'Services', board: 'services' },
  { href: '/admin/inquiries/inbox', label: 'Inbox', board: 'inbox' },
]

const contentLinks = [
  { href: '/admin/content/projects', label: 'Projects' },
  { href: '/admin/content/members', label: 'Members' },
  { href: '/admin/content/media', label: 'Media' },
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
      <div className='hidden px-3 pt-7 pb-1 font-sans text-[10px] font-semibold tracking-[1px] text-black/30 uppercase md:block'>
        {label}
      </div>
      <div className='contents md:flex md:flex-col md:gap-0.5'>{children}</div>
    </div>
  )
}

function NavContent() {
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

  const footerLinkClassName =
    'block px-3 py-2 text-left font-sans text-sm leading-tight font-medium whitespace-nowrap text-black/60 uppercase transition-colors hover:bg-black/10 hover:text-black hover:no-underline active:bg-black/20'

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
    <aside className='bg-background sticky top-0 z-20 flex shrink-0 flex-col border-b-2 border-black md:h-full md:w-56 md:border-r-2 md:border-b-0'>
      <div className='flex items-center gap-1 overflow-x-auto px-2 py-2 md:min-h-0 md:flex-1 md:flex-col md:items-stretch md:gap-0 md:overflow-x-visible md:overflow-y-auto md:px-3 md:py-0'>
        <Link
          href='/admin'
          className='flex shrink-0 items-baseline gap-2 px-2 hover:no-underline md:-mx-3 md:mb-3 md:border-b-2 md:border-black md:px-6 md:py-5'
        >
          <span className='text-[22px] leading-none font-black tracking-[-0.02em] uppercase md:text-[32px]'>
            GFNC
          </span>
          <span className='hidden font-sans text-[10px] font-semibold tracking-[1px] text-black/50 uppercase md:inline'>
            Admin
          </span>
        </Link>
        <Link className={linkClassName(pathname === '/admin')} href='/admin'>
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
        <NavGroup label='Content'>
          {contentLinks.map(link => (
            <Link
              key={link.href}
              className={linkClassName(pathname === link.href)}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </NavGroup>
        <div className='flex md:-mx-3 md:mt-auto md:flex-col md:border-t-2 md:border-black md:px-3 md:py-3'>
          <Link href='/' className={footerLinkClassName}>
            View site
          </Link>
          <button
            type='button'
            onClick={async () => {
              await signOut()
              router.push('/admin/login')
            }}
            className={footerLinkClassName}
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}

/**
 * Full-height left sidebar on desktop (brand on top, site/sign-out links
 * pinned to the bottom, the link list scrolling between them if it ever
 * outgrows the viewport); a sticky horizontal scroller on mobile. Hidden
 * entirely when signed out, so the login page gets the whole screen.
 *
 * The badge query lives in NavContent rather than here on purpose: this nav
 * renders in the admin layout, which also wraps /admin/login. <Authenticated>
 * gates rendering, not hooks — so a top-level useQuery here would still fire
 * while signed out, and admin.pipelineSummary's requireUser would throw and
 * take the login page down with it.
 */
export default function AdminNav() {
  return (
    <Authenticated>
      <NavContent />
    </Authenticated>
  )
}

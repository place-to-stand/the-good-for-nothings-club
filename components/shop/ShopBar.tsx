'use client'

import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'

import { shopPaths } from '@/lib/shopify/format'
import { cn } from '@/lib/utils'

import { CartButton } from './CartDrawer'
import SearchBox from './SearchBox'

/**
 * Second header row on shop pages: shop links, a Collections dropdown,
 * search and the cart. Sits flush under the site header, in the same
 * bordered frame.
 */

const linkClass =
  'shrink-0 px-3 py-2 text-xs font-extrabold tracking-[0.06em] whitespace-nowrap uppercase transition-colors hover:bg-black/10 hover:no-underline xl:px-4 xl:text-sm'

export default function ShopBar({
  collections,
}: {
  collections: { handle: string; title: string }[]
}) {
  return (
    <div className='relative z-20 font-sans md:px-8 xl:px-16'>
      {/* Inset to the page's content gutter so it reads as nested under the header. */}
      <div className='m-auto max-w-(--page-max-width) md:px-12'>
        <div className='bg-background relative flex flex-col border-b-2 border-black md:border-x-2 lg:flex-row lg:items-stretch'>
          <div className='flex flex-1 items-stretch'>
            <nav
              aria-label='Shop'
              className='flex flex-1 items-center gap-1 px-1.5 py-1.5 xl:px-2'
            >
              <NavLink href={shopPaths.home} text='Featured' />
              {collections.length > 0 && (
                <Dropdown
                  label='Collections'
                  items={collections.map(c => ({
                    href: shopPaths.collection(c.handle),
                    text: c.title,
                  }))}
                />
              )}
              <NavLink href={shopPaths.all} text='All Products' />
            </nav>
            <CartButton className='border-l-2 border-black lg:hidden' />
          </div>
          <Suspense fallback={<SearchBox className={searchClass} />}>
            <SearchWithQuery />
          </Suspense>
          <CartButton className='hidden border-l-2 border-black lg:flex' />
        </div>
      </div>
    </div>
  )
}

function NavLink({ href, text }: { href: string; text: string }) {
  const current = usePathname() === href
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={cn(linkClass, current && 'bg-black/10')}
    >
      {text}
    </Link>
  )
}

function Dropdown({
  label,
  items,
}: {
  label: string
  items: { href: string; text: string }[]
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLUListElement>(null)
  const triangleRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const active = items.some(item => item.href === pathname)

  const cancelClose = () => clearTimeout(closeTimer.current)
  const show = () => {
    cancelClose()
    setOpen(true)
  }
  const hide = (delay = 0) => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), delay)
  }

  // Close on outside click and Escape.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => cancelClose, [])

  // Safe triangle: an invisible shape from the pointer to the panel's top
  // corners. Moving the mouse diagonally across it keeps the menu open
  // instead of closing it as the pointer leaves the button.
  const aim = (e: React.PointerEvent) => {
    const box = ref.current?.getBoundingClientRect()
    const panel = panelRef.current
    const triangle = triangleRef.current
    if (!box || !panel || !triangle) return
    const x = e.clientX - box.left
    const y = e.clientY - box.top
    const top = panel.offsetTop
    triangle.style.width = `${Math.max(panel.offsetWidth, box.width)}px`
    triangle.style.height = `${top}px`
    triangle.style.clipPath = `polygon(${x}px ${y}px, 0px ${top}px, ${panel.offsetWidth}px ${top}px)`
  }

  return (
    <div
      ref={ref}
      className='relative'
      onPointerEnter={e => e.pointerType === 'mouse' && show()}
      onPointerLeave={e => e.pointerType === 'mouse' && hide(150)}
    >
      <div
        ref={triangleRef}
        aria-hidden='true'
        className={cn('absolute top-0 left-0', !open && 'hidden')}
      />
      <button
        type='button'
        aria-expanded={open}
        aria-haspopup='true'
        onPointerMove={aim}
        // Mouse users open it by hovering, so a click only keeps it open;
        // touch and keyboard users toggle it.
        onClick={e =>
          e.detail > 0 &&
          e.nativeEvent instanceof PointerEvent &&
          e.nativeEvent.pointerType === 'mouse'
            ? show()
            : setOpen(o => !o)
        }
        className={cn(
          linkClass,
          'relative z-10 flex cursor-pointer items-center gap-1',
          (open || active) && 'bg-black/10'
        )}
      >
        {label}
        <ChevronDown
          strokeWidth={3}
          size={14}
          className={cn(
            'transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      <ul
        ref={panelRef}
        className={cn(
          'bg-background absolute top-full left-0 z-30 min-w-56 origin-top border-2 border-black py-1 transition-[opacity,translate,visibility] duration-200 ease-out',
          open
            ? 'visible translate-y-0 opacity-100'
            : 'invisible -translate-y-1 opacity-0'
        )}
      >
        {items.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
              tabIndex={open ? undefined : -1}
              onClick={() => hide()}
              className={cn(
                'block px-4 py-2 text-xs font-extrabold tracking-[0.06em] uppercase hover:bg-black/10 hover:no-underline xl:text-sm',
                pathname === item.href && 'bg-black/10'
              )}
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const searchClass =
  'border-t-2 border-black lg:w-80 lg:border-t-0 lg:border-l-2'

function SearchWithQuery() {
  const query = useSearchParams().get('q') ?? ''
  return <SearchBox key={query} defaultValue={query} className={searchClass} />
}

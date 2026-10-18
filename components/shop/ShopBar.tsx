'use client'

import { ChevronDown } from 'lucide-react'
import Form from 'next/form'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'

import { shopPaths } from '@/lib/shopify/format'
import { cn } from '@/lib/utils'

import { CartButton } from './CartDrawer'
import { SearchIcon } from './icons'

/**
 * Second header row on shop pages: shop links, a Collections dropdown,
 * search and the cart. Sits flush under the site header, in the same
 * bordered frame.
 */

const linkClass =
  'shrink-0 px-3 py-3 text-xs font-extrabold tracking-[0.06em] whitespace-nowrap uppercase transition-colors hover:bg-black/10 hover:no-underline xl:px-4 xl:text-sm'

export default function ShopBar({
  collections,
}: {
  collections: { handle: string; title: string }[]
}) {
  const pathname = usePathname()
  const links = [
    { href: shopPaths.home, text: 'Featured' },
    { href: shopPaths.all, text: 'All' },
  ]

  return (
    <div className='relative z-20 font-sans md:px-8 xl:px-16'>
      <div className='bg-background relative m-auto flex max-w-(--page-max-width) flex-col border-b-2 border-black md:border-x-2 lg:flex-row lg:items-stretch'>
        <div className='flex flex-1 items-stretch'>
          <nav aria-label='Shop' className='flex flex-1 items-center'>
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
                className={cn(
                  linkClass,
                  pathname === link.href && 'bg-black/10'
                )}
              >
                {link.text}
              </Link>
            ))}
            {collections.length > 0 && (
              <Dropdown
                label='Collections'
                items={collections.map(c => ({
                  href: shopPaths.collection(c.handle),
                  text: c.title,
                }))}
              />
            )}
          </nav>
          <CartButton className='border-l-2 border-black lg:hidden' />
        </div>
        <Suspense fallback={<SearchForm />}>
          <SearchFormWithQuery />
        </Suspense>
        <CartButton className='hidden border-l-2 border-black lg:flex' />
      </div>
    </div>
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
  const active = items.some(item => item.href === pathname)

  // Close on pick, outside click and Escape.
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

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={cn(
          linkClass,
          'flex cursor-pointer items-center gap-1',
          (open || active) && 'bg-black/10'
        )}
      >
        {label}
        <ChevronDown
          strokeWidth={3}
          size={14}
          className={cn('transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <ul className='bg-background absolute top-full left-0 z-30 mt-0.5 min-w-56 border-2 border-black py-1 shadow-[4px_4px_0_0_#000]'>
          {items.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                onClick={() => setOpen(false)}
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
      )}
    </div>
  )
}

function SearchFormWithQuery() {
  const query = useSearchParams().get('q') ?? ''
  return <SearchForm key={query} defaultValue={query} />
}

function SearchForm({ defaultValue = '' }: { defaultValue?: string }) {
  return (
    <Form
      action={shopPaths.search()}
      role='search'
      className='flex items-stretch border-t-2 border-black lg:w-72 lg:border-t-0 lg:border-l-2'
    >
      <label htmlFor='shop-search' className='sr-only'>
        Search the shop
      </label>
      <input
        id='shop-search'
        name='q'
        type='search'
        defaultValue={defaultValue}
        placeholder='Search the shop'
        className='min-w-0 flex-1 bg-transparent px-4 py-3 text-sm placeholder:text-black/50 focus:bg-white focus:outline-none'
      />
      <button
        type='submit'
        className='flex w-12 cursor-pointer items-center justify-center border-l-2 border-black hover:bg-black/10'
        aria-label='Search'
      >
        <SearchIcon size={20} />
      </button>
    </Form>
  )
}

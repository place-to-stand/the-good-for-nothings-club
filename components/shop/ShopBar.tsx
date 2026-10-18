'use client'

import { Search } from 'lucide-react'
import Form from 'next/form'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import { shopPaths } from '@/lib/shopify/format'
import { cn } from '@/lib/utils'

/**
 * Second header row on shop pages: collection links and a search box.
 * Sits flush under the site header, in the same bordered frame.
 */
export default function ShopBar({
  collections,
}: {
  collections: { handle: string; title: string }[]
}) {
  const pathname = usePathname()
  const links = [
    { href: shopPaths.home, text: 'Shop' },
    { href: shopPaths.all, text: 'All' },
    ...collections.map(c => ({
      href: shopPaths.collection(c.handle),
      text: c.title,
    })),
  ]

  return (
    <div className='font-sans md:px-8 xl:px-16'>
      <div className='bg-background relative m-auto flex max-w-(--page-max-width) flex-col border-b-2 border-black md:border-x-2 lg:flex-row lg:items-stretch'>
        <nav
          aria-label='Shop'
          className='flex flex-1 items-center overflow-x-auto px-2 lg:flex-wrap lg:px-4'
        >
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              className={cn(
                'shrink-0 px-2 py-3 text-xs font-extrabold tracking-[0.06em] whitespace-nowrap uppercase transition-colors hover:bg-black/10 hover:no-underline xl:px-3 xl:text-sm',
                pathname === link.href && 'bg-black/10'
              )}
            >
              {link.text}
            </Link>
          ))}
        </nav>
        <Suspense fallback={<SearchForm />}>
          <SearchFormWithQuery />
        </Suspense>
      </div>
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
        <Search size={18} />
      </button>
    </Form>
  )
}

'use client'

import debounce from 'lodash.debounce'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { priceLabel, shopPaths } from '@/lib/shopify/format'
import type { PredictiveResults } from '@/lib/shopify/types'
import { cn } from '@/lib/utils'

import { CloseIcon, SearchIcon } from './icons'

type Option = { key: string; href: string }

const EMPTY: PredictiveResults = { queries: [], products: [], collections: [] }

/**
 * Shop search with suggestions as you type: matching searches, products
 * and collections from Shopify's predictive search. Enter or the search
 * button goes to the full results page.
 */
export default function SearchBox({
  defaultValue = '',
  className,
}: {
  defaultValue?: string
  className?: string
}) {
  const router = useRouter()
  const id = useId()
  const listId = `${id}-list`
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLFormElement>(null)
  const [value, setValue] = useState(defaultValue)
  const [results, setResults] = useState<PredictiveResults>(EMPTY)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const fetchResults = useMemo(
    () =>
      debounce(async (q: string, signal: AbortSignal) => {
        try {
          const res = await fetch(
            `/api/shop/suggest?q=${encodeURIComponent(q)}`,
            { signal }
          )
          if (res.ok) setResults(await res.json())
        } catch {
          // Aborted or offline: keep the last results.
        }
      }, 150),
    []
  )

  useEffect(() => {
    const q = value.trim()
    if (q.length < 2) return
    const controller = new AbortController()
    fetchResults(q, controller.signal)
    return () => controller.abort()
  }, [value, fetchResults])

  useEffect(() => () => fetchResults.cancel(), [fetchResults])

  // Close when focus or a click lands outside the box.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const shown = value.trim().length >= 2 ? results : EMPTY
  const queries = shown.queries
    .filter(q => q.toLowerCase() !== value.trim().toLowerCase())
    .slice(0, 3)

  // Flat list of options, in screen order, for the arrow keys.
  const options: Option[] = [
    ...queries.map(q => ({ key: `q:${q}`, href: shopPaths.search(q) })),
    ...shown.products.map(p => ({
      key: `p:${p.handle}`,
      href: shopPaths.product(p.handle),
    })),
    ...shown.collections.map(c => ({
      key: `c:${c.handle}`,
      href: shopPaths.collection(c.handle),
    })),
  ]
  const hasResults = options.length > 0
  const expanded = open && hasResults
  const optionId = (i: number) => `${id}-opt-${i}`
  const indexOf = (key: string) => options.findIndex(o => o.key === key)

  function go(href: string) {
    setOpen(false)
    setActive(-1)
    inputRef.current?.blur()
    router.push(href)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      // First Escape closes the list; the second clears the box.
      if (expanded) {
        e.preventDefault()
        setOpen(false)
      } else setValue('')
      return
    }
    if (!hasResults) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      const step = e.key === 'ArrowDown' ? 1 : -1
      // -1 is the text box itself; wrap around through it.
      setActive(i => {
        const next = i + step
        if (next >= options.length) return -1
        if (next < -1) return options.length - 1
        return next
      })
    }
    if (e.key === 'Enter' && expanded && active >= 0 && options[active]) {
      e.preventDefault()
      go(options[active].href)
    }
  }

  const rowClass = (key: string) =>
    cn(
      'flex items-center gap-3 px-4 py-2 hover:bg-black/10 hover:no-underline',
      indexOf(key) === active && 'bg-black/10'
    )

  return (
    <form
      ref={boxRef}
      action={shopPaths.search()}
      role='search'
      onSubmit={e => {
        e.preventDefault()
        const q = value.trim()
        if (q) go(shopPaths.search(q))
      }}
      className={cn('relative flex items-stretch', className)}
    >
      <label htmlFor={`${id}-input`} className='sr-only'>
        Search the shop
      </label>
      <input
        ref={inputRef}
        id={`${id}-input`}
        name='q'
        type='search'
        role='combobox'
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete='list'
        aria-activedescendant={
          expanded && active >= 0 ? optionId(active) : undefined
        }
        autoComplete='off'
        value={value}
        onChange={e => {
          setValue(e.target.value)
          setActive(-1)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder='Search the shop'
        className='min-w-0 flex-1 bg-transparent px-4 py-3 text-sm placeholder:text-black/50 focus:bg-white focus:outline-none [&::-webkit-search-cancel-button]:appearance-none'
      />
      {value && (
        <button
          type='button'
          aria-label='Clear search'
          onClick={() => {
            setValue('')
            setResults(EMPTY)
            inputRef.current?.focus()
          }}
          className='flex w-10 items-center justify-center bg-white hover:bg-black/10'
        >
          <CloseIcon size={16} />
        </button>
      )}
      <button
        type='submit'
        className='flex w-12 cursor-pointer items-center justify-center border-l-2 border-black hover:bg-black/10'
        aria-label='Search'
      >
        <SearchIcon size={22} />
      </button>

      <div
        id={listId}
        role='listbox'
        aria-label='Suggestions'
        className={cn(
          'bg-background absolute top-full right-0 left-0 z-30 -mx-0.5 max-h-[70vh] overflow-y-auto border-2 border-black py-2 transition-[opacity,translate,visibility] duration-200 ease-out lg:left-auto lg:w-[26rem]',
          expanded
            ? 'visible translate-y-0 opacity-100'
            : 'invisible -translate-y-1 opacity-0'
        )}
      >
        {queries.length > 0 && (
          <Group title='Searches'>
            {queries.map(q => (
              <Link
                key={q}
                id={optionId(indexOf(`q:${q}`))}
                role='option'
                aria-selected={indexOf(`q:${q}`) === active}
                href={shopPaths.search(q)}
                onClick={() => setOpen(false)}
                className={cn(rowClass(`q:${q}`), 'text-sm font-semibold')}
              >
                <SearchIcon size={14} />
                {q}
              </Link>
            ))}
          </Group>
        )}
        {shown.products.length > 0 && (
          <Group title='Products'>
            {shown.products.map(p => {
              const key = `p:${p.handle}`
              const img = p.featuredImage
              return (
                <Link
                  key={key}
                  id={optionId(indexOf(key))}
                  role='option'
                  aria-selected={indexOf(key) === active}
                  href={shopPaths.product(p.handle)}
                  onClick={() => setOpen(false)}
                  className={rowClass(key)}
                >
                  <span className='relative size-12 shrink-0 border-2 border-black bg-white'>
                    {img && (
                      <Image
                        src={img.url}
                        alt=''
                        fill
                        sizes='48px'
                        className='object-cover'
                      />
                    )}
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-sm font-extrabold'>
                      {p.title}
                    </span>
                    <span className='block text-xs font-semibold text-black/70'>
                      {p.availableForSale ? priceLabel(p) : 'Sold out'}
                    </span>
                  </span>
                </Link>
              )
            })}
          </Group>
        )}
        {shown.collections.length > 0 && (
          <Group title='Collections'>
            {shown.collections.map(c => {
              const key = `c:${c.handle}`
              return (
                <Link
                  key={key}
                  id={optionId(indexOf(key))}
                  role='option'
                  aria-selected={indexOf(key) === active}
                  href={shopPaths.collection(c.handle)}
                  onClick={() => setOpen(false)}
                  className={cn(
                    rowClass(key),
                    'text-sm font-extrabold uppercase'
                  )}
                >
                  {c.title}
                </Link>
              )
            })}
          </Group>
        )}
        <Link
          href={shopPaths.search(value.trim())}
          onClick={() => setOpen(false)}
          className='mt-1 block border-t-2 border-black px-4 pt-3 pb-1 text-xs font-extrabold tracking-[0.06em] uppercase hover:no-underline'
        >
          See all results for “{value.trim()}”
        </Link>
      </div>
    </form>
  )
}

function Group({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div role='group' aria-label={title} className='py-1'>
      <p className='px-4 pb-1 text-[11px] font-bold tracking-[0.1em] text-black/60 uppercase'>
        {title}
      </p>
      {children}
    </div>
  )
}

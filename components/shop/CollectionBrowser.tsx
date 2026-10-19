'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  checkboxClassName,
  fieldLabelClassName,
  selectClassName,
} from '@/components/ui/fieldStyles'
import { shopCopy } from '@/data/shop'
import { deriveFilters, matches } from '@/lib/shopify/filters'
import type { ProductCard, ShopFilter } from '@/lib/shopify/types'
import { cn } from '@/lib/utils'

import { ProductGrid } from './ProductCard'

const SORTS = {
  featured: 'Featured',
  newest: 'Newest',
  'price-asc': 'Price, low to high',
  'price-desc': 'Price, high to low',
} as const

type Sort = keyof typeof SORTS

const minPrice = (p: ProductCard) => Number(p.priceRange.minVariantPrice.amount)

/** Everything the shopper has picked. Mirrors the URL. */
type State = {
  sort: Sort
  inStock: boolean
  /** Filter id to the value keys ticked in it. */
  picked: Record<string, string[]>
  priceMin: string
  priceMax: string
}

const PRICE_MIN = 'filter.v.price.gte'
const PRICE_MAX = 'filter.v.price.lte'

/**
 * Product grid with sort and filters. The filters come from Search &
 * Discovery when the collection has them, or from the products otherwise.
 * Collections hold a few dozen products at most, so the browser does the
 * filtering and the page itself stays static. Choices live in the URL
 * (?sort=price-asc&instock=1&filter.v.option.size=m) so a view can be shared.
 */
export default function CollectionBrowser({
  products,
  filters,
}: {
  products: ProductCard[]
  filters?: ShopFilter[]
}) {
  const groups = useMemo(
    () => (filters?.length ? filters : deriveFilters(products)),
    [filters, products]
  )
  // Reading the URL needs a Suspense boundary; the static page shows the
  // unfiltered grid until it resolves.
  return (
    <Suspense
      fallback={<Browser products={products} groups={groups} initial={EMPTY} />}
    >
      <BrowserWithParams products={products} groups={groups} />
    </Suspense>
  )
}

const EMPTY: State = {
  sort: 'featured',
  inStock: false,
  picked: {},
  priceMin: '',
  priceMax: '',
}

function BrowserWithParams(props: {
  products: ProductCard[]
  groups: ShopFilter[]
}) {
  const params = useSearchParams()
  const sort = params.get('sort') ?? ''
  const initial: State = {
    sort: sort in SORTS ? (sort as Sort) : 'featured',
    inStock: params.get('instock') === '1',
    picked: Object.fromEntries(
      props.groups.map(g => [g.id, params.getAll(g.id)])
    ),
    priceMin: params.get(PRICE_MIN) ?? '',
    priceMax: params.get(PRICE_MAX) ?? '',
  }
  return <Browser {...props} initial={initial} />
}

function writeUrl(state: State, groups: ShopFilter[]) {
  const next = new URLSearchParams(window.location.search)
  for (const key of [...next.keys()])
    if (key.startsWith('filter.') || key === 'sort' || key === 'instock')
      next.delete(key)
  if (state.sort !== 'featured') next.set('sort', state.sort)
  if (state.inStock) next.set('instock', '1')
  for (const g of groups)
    for (const key of state.picked[g.id] ?? []) next.append(g.id, key)
  if (state.priceMin) next.set(PRICE_MIN, state.priceMin)
  if (state.priceMax) next.set(PRICE_MAX, state.priceMax)
  const qs = next.toString()
  // Swap the query string in place: no navigation or refetch.
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${qs ? `?${qs}` : ''}`
  )
}

function Browser({
  products,
  groups,
  initial,
}: {
  products: ProductCard[]
  groups: ShopFilter[]
  initial: State
}) {
  // Held here as well as in the URL so ticks show at once.
  const [state, setState] = useState(initial)
  const [sheetOpen, setSheetOpen] = useState(false)

  function update(change: Partial<State>) {
    const next = { ...state, ...change }
    setState(next)
    writeUrl(next, groups)
  }

  const shown = useMemo(() => {
    const min = state.priceMin === '' ? -Infinity : Number(state.priceMin)
    const max = state.priceMax === '' ? Infinity : Number(state.priceMax)
    const list = products.filter(
      p =>
        (!state.inStock || p.availableForSale) &&
        minPrice(p) >= min &&
        minPrice(p) <= max &&
        // Any ticked value within a group, every group with a tick.
        groups.every(g => {
          const keys = state.picked[g.id] ?? []
          if (!keys.length) return true
          return g.values.some(v => keys.includes(v.key) && matches(p, v.match))
        })
    )
    if (state.sort === 'newest')
      return list.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (state.sort === 'price-asc')
      return list.toSorted((a, b) => minPrice(a) - minPrice(b))
    if (state.sort === 'price-desc')
      return list.toSorted((a, b) => minPrice(b) - minPrice(a))
    return list
  }, [products, groups, state])

  const activeCount =
    Number(state.inStock) +
    Object.values(state.picked).reduce((n, keys) => n + keys.length, 0) +
    Number(Boolean(state.priceMin || state.priceMax))

  const clear = () =>
    update({ inStock: false, picked: {}, priceMin: '', priceMax: '' })

  const panel = (
    <FilterPanel
      products={products}
      groups={groups}
      state={state}
      update={update}
    />
  )

  return (
    <div className='pt-4 lg:grid lg:grid-cols-[13rem_1fr] lg:gap-x-10'>
      <aside aria-label='Filters' className='hidden lg:block'>
        <div className='sticky top-28 pb-8'>
          {panel}
          {activeCount > 0 && (
            <button
              type='button'
              onClick={clear}
              className='mt-6 cursor-pointer text-sm font-bold underline underline-offset-2'
            >
              Clear filters
            </button>
          )}
        </div>
      </aside>

      <div className='min-w-0'>
        <div className='flex items-center gap-4 pb-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => setSheetOpen(true)}
            className='h-10 lg:hidden'
          >
            Filters{activeCount > 0 && ` (${activeCount})`}
          </Button>
          <p className='hidden text-sm font-semibold lg:block'>
            {shown.length} {shown.length === 1 ? 'product' : 'products'}
          </p>
          <label
            className={cn(
              fieldLabelClassName,
              'ml-auto flex items-center gap-2'
            )}
          >
            <span className='hidden sm:inline'>Sort</span>
            <select
              value={state.sort}
              onChange={e => update({ sort: e.target.value as Sort })}
              className={cn(selectClassName, 'w-auto font-normal')}
            >
              {Object.entries(SORTS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {shown.length ? (
          <ProductGrid products={shown} className='lg:grid-cols-3' />
        ) : (
          <p className='py-12 text-center font-serif text-2xl'>
            {shopCopy.noMatches}
          </p>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side='left'
          className='flex w-full flex-col gap-0 border-r-2 border-black p-0 sm:max-w-sm'
        >
          <SheetHeader className='h-19 shrink-0 justify-center space-y-0 border-b-2 border-black px-5 text-left'>
            <SheetTitle className='text-2xl font-black uppercase [text-box:trim-both_cap_alphabetic]'>
              Filters
            </SheetTitle>
            <SheetDescription className='sr-only'>
              Narrow the products shown.
            </SheetDescription>
          </SheetHeader>
          <div className='flex-1 overflow-y-auto p-5'>{panel}</div>
          <div className='flex gap-3 border-t-2 border-black p-5'>
            <Button
              type='button'
              variant='outline'
              onClick={clear}
              disabled={activeCount === 0}
              className='flex-1'
            >
              Clear
            </Button>
            <Button
              type='button'
              onClick={() => setSheetOpen(false)}
              className='flex-1'
            >
              Show {shown.length}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function FilterPanel({
  products,
  groups,
  state,
  update,
}: {
  products: ProductCard[]
  groups: ShopFilter[]
  state: State
  update: (change: Partial<State>) => void
}) {
  return (
    <div className='space-y-6'>
      <label
        className={cn(
          fieldLabelClassName,
          'flex cursor-pointer items-center gap-2'
        )}
      >
        <input
          type='checkbox'
          checked={state.inStock}
          onChange={e => update({ inStock: e.target.checked })}
          className={checkboxClassName}
        />
        In stock only
      </label>

      {groups.map(g => {
        if (g.type === 'PRICE_RANGE')
          return (
            <fieldset key={g.id}>
              <Legend>{g.label}</Legend>
              <div className='flex items-center gap-2'>
                <Input
                  type='number'
                  inputMode='decimal'
                  min={0}
                  placeholder='$ Min'
                  aria-label='Lowest price'
                  value={state.priceMin}
                  onChange={e => update({ priceMin: e.target.value })}
                />
                <span aria-hidden>to</span>
                <Input
                  type='number'
                  inputMode='decimal'
                  min={0}
                  placeholder='$ Max'
                  aria-label='Highest price'
                  value={state.priceMax}
                  onChange={e => update({ priceMax: e.target.value })}
                />
              </div>
            </fieldset>
          )

        // Hide values nothing here matches, and groups left with nothing.
        const values = g.values
          .map(v => ({
            ...v,
            count: products.filter(p => matches(p, v.match)).length,
          }))
          .filter(v => v.count > 0)
        if (!values.length) return null
        const picked = state.picked[g.id] ?? []
        return (
          <fieldset key={g.id}>
            <Legend>{g.label}</Legend>
            <ul className='space-y-2'>
              {values.map(v => (
                <li key={v.key}>
                  <label className='flex cursor-pointer items-center gap-2 text-sm'>
                    <input
                      type='checkbox'
                      checked={picked.includes(v.key)}
                      onChange={e =>
                        update({
                          picked: {
                            ...state.picked,
                            [g.id]: e.target.checked
                              ? [...picked, v.key]
                              : picked.filter(k => k !== v.key),
                          },
                        })
                      }
                      className={checkboxClassName}
                    />
                    {v.label}
                    <span className='text-black/50'>({v.count})</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        )
      })}
    </div>
  )
}

function Legend({ children }: { children: React.ReactNode }) {
  return (
    <legend className='mb-3 text-xs font-extrabold tracking-[0.08em] uppercase'>
      {children}
    </legend>
  )
}

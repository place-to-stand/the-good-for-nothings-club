'use client'

import { useMemo, useState } from 'react'

import {
  checkboxClassName,
  fieldLabelClassName,
  selectClassName,
} from '@/components/ui/fieldStyles'
import { shopCopy } from '@/data/shop'
import type { ProductCard } from '@/lib/shopify/types'
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

/**
 * Product grid with sort and filters. Collections hold a few dozen
 * products at most, so this works in the browser on the full list and
 * the page itself stays static.
 */
export default function CollectionBrowser({
  products,
}: {
  products: ProductCard[]
}) {
  const [sort, setSort] = useState<Sort>('featured')
  const [type, setType] = useState<string | null>(null)
  const [inStockOnly, setInStockOnly] = useState(false)

  const types = useMemo(
    () => [...new Set(products.map(p => p.productType).filter(Boolean))].sort(),
    [products]
  )

  const shown = useMemo(() => {
    const list = products.filter(
      p =>
        (!type || p.productType === type) &&
        (!inStockOnly || p.availableForSale)
    )
    if (sort === 'newest')
      return list.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (sort === 'price-asc')
      return list.toSorted((a, b) => minPrice(a) - minPrice(b))
    if (sort === 'price-desc')
      return list.toSorted((a, b) => minPrice(b) - minPrice(a))
    return list
  }, [products, sort, type, inStockOnly])

  return (
    <>
      <div className='flex flex-wrap items-center gap-x-4 gap-y-3 py-4'>
        {types.length > 1 && (
          <div
            className='flex flex-wrap gap-2'
            role='group'
            aria-label='Filter by type'
          >
            <Chip active={type === null} onClick={() => setType(null)}>
              All
            </Chip>
            {types.map(t => (
              <Chip key={t} active={type === t} onClick={() => setType(t)}>
                {t}
              </Chip>
            ))}
          </div>
        )}

        <div className='ml-auto flex flex-wrap items-center gap-4'>
          <label
            className={cn(
              fieldLabelClassName,
              'flex cursor-pointer items-center gap-2'
            )}
          >
            <input
              type='checkbox'
              checked={inStockOnly}
              onChange={e => setInStockOnly(e.target.checked)}
              className={checkboxClassName}
            />
            In stock
          </label>
          <label className={cn(fieldLabelClassName, 'flex items-center gap-2')}>
            Sort
            <select
              value={sort}
              onChange={e => setSort(e.target.value as Sort)}
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
      </div>

      {shown.length ? (
        <ProductGrid products={shown} />
      ) : (
        <p className='py-12 text-center font-serif text-2xl'>
          {shopCopy.noMatches}
        </p>
      )}
    </>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type='button'
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'cursor-pointer border-2 border-black px-3 py-1 text-sm font-bold tracking-[0.04em] uppercase transition-colors',
        active ? 'bg-black text-white' : 'bg-transparent hover:bg-black/10'
      )}
    >
      {children}
    </button>
  )
}

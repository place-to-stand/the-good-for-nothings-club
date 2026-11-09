'use client'

import { useState } from 'react'

import { isColorName, swatchOf } from '@/lib/shopify/swatches'
import type { ProductCard } from '@/lib/shopify/types'

const MAX_SWATCHES = 5

/**
 * The product's colors as small squares under the card's price. With a
 * mouse, the name of the one under the pointer shows beside them.
 */
export default function CardSwatches({ product }: { product: ProductCard }) {
  const [peek, setPeek] = useState<string | null>(null)
  const colors = [
    ...new Set(
      product.quickVariants.flatMap(v =>
        v.selectedOptions.filter(o => isColorName(o.name)).map(o => o.value)
      )
    ),
  ]
  const shown = colors.filter(c => swatchOf(c)).slice(0, MAX_SWATCHES)
  if (shown.length < 2) return null
  const extra = colors.length - shown.length
  return (
    <div
      aria-label={`${colors.length} colors: ${colors.join(', ')}`}
      role='img'
      className='mt-1 flex min-h-4 items-center gap-1.5'
    >
      {shown.map(color => (
        <span
          key={color}
          onPointerEnter={e => e.pointerType === 'mouse' && setPeek(color)}
          onPointerLeave={() => setPeek(null)}
          style={{ backgroundColor: swatchOf(color) }}
          className='size-4 shrink-0 border-[1.5px] border-black'
        />
      ))}
      <span className='ml-0.5 truncate text-xs font-semibold text-black/60'>
        {peek ?? (extra > 0 ? `+${extra}` : '')}
      </span>
    </div>
  )
}

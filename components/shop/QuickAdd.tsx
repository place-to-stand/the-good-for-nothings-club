'use client'

import { useEffect, useRef, useState } from 'react'

import type { QuickVariant } from '@/lib/shopify/types'
import { cn } from '@/lib/utils'

import { useCart } from './CartProvider'
import { flyToCart } from './flyToCart'
import { CheckIcon, PlusIcon } from './icons'

/**
 * The + in the corner of a product card's photo. One variant: adds it.
 * Several (sizes): opens a row of choices first. Shows on hover, and
 * always on touch screens.
 */
export default function QuickAdd({
  title,
  variants,
}: {
  title: string
  variants: QuickVariant[]
}) {
  const { addItem } = useCart()
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<'idle' | 'adding' | 'added'>('idle')
  const root = useRef<HTMLDivElement>(null)

  const single = variants.length === 1
  const showChoices = open && !single

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!variants.some(v => v.availableForSale)) return null

  async function add(variantId: string) {
    setOpen(false)
    setState('adding')
    const flew = flyToCart(root.current?.closest('[data-card]') ?? null)
    const ok = await addItem(variantId, { open: !flew })
    setState(ok ? 'added' : 'idle')
    if (ok) setTimeout(() => setState('idle'), 1500)
  }

  return (
    <div
      ref={root}
      // Spans the photo so the size row can use its full width on small
      // cards; only the buttons take clicks.
      className='absolute inset-x-2 bottom-2 flex flex-col items-end gap-2 *:pointer-events-auto'
      // Moving the mouse away closes the size row. Mouse only: a touch
      // "leaves" as each tap ends, which would close it mid-tap.
      onPointerLeave={e => e.pointerType === 'mouse' && setOpen(false)}
    >
      {showChoices && (
        <div
          role='group'
          aria-label={`Choose ${title}`}
          className='bg-background grid w-full grid-cols-[repeat(auto-fit,minmax(2.25rem,1fr))] gap-1 border-2 border-black p-1'
        >
          {variants.map(v => (
            <button
              key={v.id}
              type='button'
              disabled={!v.availableForSale}
              onClick={() => add(v.id)}
              className='cursor-pointer border-2 border-black bg-white px-1 py-1.5 text-xs font-bold uppercase transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:text-black/40 disabled:line-through disabled:hover:bg-white'
            >
              {v.title}
            </button>
          ))}
        </div>
      )}
      <button
        type='button'
        aria-label={
          single ? `Add ${title} to cart` : `Choose a size of ${title}`
        }
        aria-expanded={single ? undefined : open}
        disabled={state === 'adding'}
        onClick={() => (single ? add(variants[0].id) : setOpen(o => !o))}
        className={cn(
          'bg-background flex size-10 cursor-pointer items-center justify-center border-2 border-black transition-[opacity,translate,background-color] duration-200 ease-out hover:bg-black hover:text-white',
          'translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100',
          (open || state !== 'idle') && 'translate-y-0 opacity-100',
          state === 'added' && 'bg-black text-white'
        )}
      >
        {state === 'added' ? (
          <CheckIcon size={20} />
        ) : (
          <PlusIcon
            size={20}
            className={cn(
              'transition-transform duration-200',
              showChoices && 'rotate-45'
            )}
          />
        )}
      </button>
    </div>
  )
}

'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'

import { Button, slideFillClassName } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatMoney, priceLabel } from '@/lib/shopify/format'
import type { ProductCard } from '@/lib/shopify/types'
import { cn } from '@/lib/utils'

import { useCart } from './CartProvider'
import { flyToCart } from './flyToCart'
import { CheckIcon, PlusIcon } from './icons'
import {
  OptionPicker,
  optionsOf,
  useAddedFlash,
  useVariantSelection,
} from './VariantOptions'

/**
 * The + in the corner of a product card's photo. One variant: adds it.
 * Several (sizes, colours): opens a small window to choose first. Shows
 * on hover, and always on touch screens.
 */
export default function QuickAdd({ product }: { product: ProductCard }) {
  const { addItem } = useCart()
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [added, flashAdded] = useAddedFlash()
  const root = useRef<HTMLDivElement>(null)

  const variants = product.quickVariants
  const options = optionsOf(variants)
  const single = options.length === 0

  if (!variants.some(v => v.availableForSale)) return null

  async function add(variantId: string, from: Element | null) {
    setAdding(true)
    setOpen(false)
    const flew = flyToCart(from)
    const ok = await addItem(variantId, { open: !flew })
    setAdding(false)
    if (ok) flashAdded()
  }

  return (
    <div ref={root} className='pointer-events-auto absolute right-2 bottom-2'>
      <button
        type='button'
        aria-label={
          single ? `Add ${product.title} to cart` : `Choose ${product.title}`
        }
        aria-haspopup={single ? undefined : 'dialog'}
        disabled={adding}
        onClick={() =>
          single
            ? add(variants[0].id, root.current?.closest('[data-card]') ?? null)
            : setOpen(true)
        }
        className={cn(
          slideFillClassName,
          'bg-background flex size-10 cursor-pointer items-center justify-center border-2 border-black',
          // Hidden until the card is hovered; always shown on touch.
          'translate-y-1 opacity-0 transition-[opacity,translate,color] group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100',
          (adding || added) && 'translate-y-0 opacity-100',
          added && 'bg-black text-white'
        )}
      >
        {added ? <CheckIcon size={20} /> : <PlusIcon size={20} />}
      </button>

      {!single && (
        <Choose
          product={product}
          options={options}
          open={open}
          onOpenChange={setOpen}
          onAdd={add}
        />
      )}
    </div>
  )
}

function Choose({
  product,
  options,
  open,
  onOpenChange,
  onAdd,
}: {
  product: ProductCard
  options: ReturnType<typeof optionsOf>
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (variantId: string, from: Element | null) => void
}) {
  const { selection, variant, choose, isAvailable } = useVariantSelection(
    product.quickVariants
  )
  const photo = useRef<HTMLDivElement>(null)
  const image = product.featuredImage

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto rounded-none border-2 border-black p-0 sm:max-w-md'>
        <div className='flex gap-4 border-b-2 border-black p-5 pr-14'>
          {image && (
            <div
              ref={photo}
              className='relative size-20 shrink-0 border-2 border-black bg-white'
            >
              <Image
                src={image.url}
                alt=''
                fill
                sizes='80px'
                className='object-cover'
              />
            </div>
          )}
          <div>
            <DialogTitle className='font-sans text-lg leading-tight font-black uppercase'>
              {product.title}
            </DialogTitle>
            <DialogDescription className='mt-1 text-base font-bold'>
              {variant ? formatMoney(variant.price) : priceLabel(product)}
            </DialogDescription>
          </div>
        </div>
        <div className='p-5'>
          <OptionPicker
            options={options}
            selection={selection}
            choose={choose}
            isAvailable={isAvailable}
            className='mb-5'
          />
          <Button
            size='lg'
            className='w-full'
            disabled={!variant?.availableForSale}
            onClick={() => variant && onAdd(variant.id, photo.current)}
          >
            {!variant
              ? 'Unavailable'
              : variant.availableForSale
                ? 'Add to cart'
                : 'Sold out'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

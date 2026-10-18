'use client'

import Image from 'next/image'
import { useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/Button'
import { formatMoney } from '@/lib/shopify/format'
import type { Product, ProductVariant, ShopImage } from '@/lib/shopify/types'
import { cn } from '@/lib/utils'

import { useCart } from './CartProvider'

type Selection = Record<string, string>

const matches = (variant: ProductVariant, selection: Selection) =>
  variant.selectedOptions.every(o => selection[o.name] === o.value)

const selectionOf = (variant: ProductVariant): Selection =>
  Object.fromEntries(variant.selectedOptions.map(o => [o.name, o.value]))

/**
 * Product page body: image gallery, option pickers, price, add to cart.
 * `children` is the product description, rendered on the server.
 */
export default function ProductDetail({
  product,
  children,
}: {
  product: Product
  children?: ReactNode
}) {
  const { addItem, isPending, error } = useCart()

  const firstVariant =
    product.variants.find(v => v.availableForSale) ?? product.variants[0]
  const [selection, setSelection] = useState<Selection>(() =>
    firstVariant ? selectionOf(firstVariant) : {}
  )
  const variant = product.variants.find(v => matches(v, selection))

  // A product with one variant has a single "Title: Default Title" option.
  const options = product.options.filter(
    o =>
      !(
        o.optionValues.length === 1 &&
        o.optionValues[0].name === 'Default Title'
      )
  )

  const images = product.images.length
    ? product.images
    : product.featuredImage
      ? [product.featuredImage]
      : []
  const [imageUrl, setImageUrl] = useState(images[0]?.url)
  const current = images.find(i => i.url === imageUrl) ?? images[0]

  function choose(name: string, value: string) {
    const next = { ...selection, [name]: value }
    // If that combination doesn't exist, keep the new value and take the
    // first variant that has it.
    const exact = product.variants.find(v => matches(v, next))
    const fallback = product.variants.find(v =>
      v.selectedOptions.some(o => o.name === name && o.value === value)
    )
    const picked = exact ?? fallback
    setSelection(picked ? selectionOf(picked) : next)
    if (picked?.image) setImageUrl(picked.image.url)
  }

  const isAvailable = (name: string, value: string) =>
    product.variants.some(
      v => v.availableForSale && matches(v, { ...selection, [name]: value })
    )

  const [added, setAdded] = useState(false)
  async function add() {
    if (!variant) return
    setAdded(false)
    setAdded(await addItem(variant.id))
  }

  const price = variant?.price ?? product.priceRange.minVariantPrice
  const compareAt =
    variant?.compareAtPrice &&
    Number(variant.compareAtPrice.amount) > Number(price.amount)
      ? variant.compareAtPrice
      : null

  return (
    <div className='grid gap-8 md:grid-cols-2 md:gap-12'>
      <Gallery
        images={images}
        current={current}
        title={product.title}
        onSelect={setImageUrl}
      />

      <div className='flex flex-col'>
        <h1 className='text-[32px] leading-none font-black tracking-[-0.04em] md:text-[48px]'>
          {product.title}
        </h1>
        <p className='mt-3 text-xl font-bold'>
          {formatMoney(price)}
          {compareAt && (
            <s className='ml-3 font-normal text-black/50'>
              {formatMoney(compareAt)}
            </s>
          )}
        </p>

        {options.map(option => (
          <fieldset key={option.id} className='mt-6'>
            <legend className='text-sm font-bold tracking-[0.06em] uppercase'>
              {option.name}
              <span className='ml-2 font-normal normal-case'>
                {selection[option.name]}
              </span>
            </legend>
            <div className='mt-2 flex flex-wrap gap-2'>
              {option.optionValues.map(({ name: value }) => {
                const selected = selection[option.name] === value
                const available = isAvailable(option.name, value)
                return (
                  <button
                    key={value}
                    type='button'
                    aria-pressed={selected}
                    onClick={() => choose(option.name, value)}
                    className={cn(
                      'min-w-12 cursor-pointer border-2 border-black px-3 py-2 text-sm font-bold uppercase transition-colors',
                      selected
                        ? 'bg-black text-white'
                        : 'bg-white hover:bg-black/10',
                      !available && 'text-black/40 line-through',
                      !available && selected && 'text-white/60'
                    )}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}

        <Button
          size='lg'
          className='mt-8 w-full'
          disabled={!variant?.availableForSale || isPending}
          onClick={add}
        >
          {!variant
            ? 'Unavailable'
            : !variant.availableForSale
              ? 'Sold out'
              : isPending
                ? 'Adding…'
                : 'Add to cart'}
        </Button>
        <p aria-live='polite' className='mt-2 min-h-5 text-sm font-semibold'>
          {error ? (
            <span className='text-red-700'>{error}</span>
          ) : added ? (
            'Added to your cart.'
          ) : null}
        </p>

        {children}
      </div>
    </div>
  )
}

function Gallery({
  images,
  current,
  title,
  onSelect,
}: {
  images: ShopImage[]
  current: ShopImage | undefined
  title: string
  onSelect: (url: string) => void
}) {
  return (
    <div>
      <div className='relative aspect-square border-2 border-black bg-white'>
        {current && (
          <Image
            src={current.url}
            alt={current.altText ?? title}
            fill
            priority
            sizes='(min-width: 768px) 45vw, 100vw'
            className='object-contain'
          />
        )}
      </div>
      {images.length > 1 && (
        <ul className='mt-3 grid grid-cols-5 gap-2'>
          {images.map((image, i) => (
            <li key={image.url}>
              <button
                type='button'
                onClick={() => onSelect(image.url)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={image.url === current?.url}
                className={cn(
                  'relative block aspect-square w-full cursor-pointer border-2 bg-white',
                  image.url === current?.url
                    ? 'border-black'
                    : 'border-black/20 hover:border-black'
                )}
              >
                <Image
                  src={image.url}
                  alt=''
                  fill
                  sizes='15vw'
                  className='object-contain'
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

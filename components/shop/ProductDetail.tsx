'use client'

import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/counter.css'

import Image from 'next/image'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import { Button } from '@/components/ui/Button'
import { formatMoney } from '@/lib/shopify/format'
import type { Product, ProductVariant, ShopImage } from '@/lib/shopify/types'
import { cn } from '@/lib/utils'

import { useCart } from './CartProvider'
import { flyToCart } from './flyToCart'
import { ArrowIcon, CloseIcon } from './icons'

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
    // Fly the photo to the cart while the request runs; it lands about
    // when the count updates.
    const flew = flyToCart(
      document.querySelector<HTMLImageElement>(
        '[data-product-photo] img[data-current]'
      )
    )
    setAdded(false)
    setAdded(await addItem(variant.id, { open: !flew }))
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

/** Shopify's CDN resizes on the fly: ask for a width, keep other params. */
const sized = (url: string, width: number) =>
  `${url}${url.includes('?') ? '&' : '?'}width=${width}`

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
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const viewed = useRef(0)
  // Stable slides: a new array would send the lightbox back to the start.
  const slides = useMemo(
    () =>
      images.map(image => ({
        src: sized(image.url, 2400),
        alt: image.altText ?? title,
        width: image.width ?? undefined,
        height: image.height ?? undefined,
      })),
    [images, title]
  )
  const currentIndex = Math.max(
    0,
    images.findIndex(i => i.url === current?.url)
  )

  return (
    <div>
      <button
        type='button'
        onClick={() => current && setLightboxIndex(currentIndex)}
        aria-label={`Enlarge image ${currentIndex + 1} of ${images.length}`}
        data-product-photo
        className='group relative block aspect-square w-full cursor-zoom-in overflow-hidden border-2 border-black bg-white'
      >
        {/* Every photo is loaded up front and stacked; switching cross-fades
            to the one picked, so clicking through the strip never waits. */}
        {images.map((image, i) => (
          <Image
            key={image.url}
            src={image.url}
            alt={image === current ? (image.altText ?? title) : ''}
            data-current={image === current || undefined}
            fill
            priority={i === 0}
            loading={i === 0 ? undefined : 'eager'}
            fetchPriority={i === 0 ? 'high' : 'low'}
            sizes='(min-width: 768px) 45vw, 100vw'
            className={cn(
              'object-contain transition-[opacity,scale] duration-[250ms,700ms] ease-out group-hover:scale-[1.03]',
              image === current ? 'opacity-100' : 'opacity-0'
            )}
          />
        ))}
      </button>
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
      <Lightbox
        open={lightboxIndex > -1}
        index={lightboxIndex}
        // Leave the page showing whichever photo was last viewed.
        on={{
          view: ({ index }) => {
            viewed.current = index
          },
        }}
        close={() => {
          const last = images[viewed.current]
          if (last) onSelect(last.url)
          setLightboxIndex(-1)
        }}
        plugins={[Counter, Zoom]}
        slides={slides}
        carousel={{ finite: images.length < 3 }}
        controller={{ closeOnBackdropClick: true }}
        counter={{
          container: {
            className: 'font-sans',
            style: { top: 'auto', bottom: 0, left: 'auto', right: 0 },
          },
        }}
        render={{
          iconPrev: () => <ArrowIcon direction='left' size={32} />,
          iconNext: () => <ArrowIcon size={32} />,
          iconClose: () => <CloseIcon size={28} />,
          iconZoomIn: () => null,
          iconZoomOut: () => null,
          ...(images.length < 2 && {
            buttonPrev: () => null,
            buttonNext: () => null,
          }),
        }}
      />
    </div>
  )
}

'use client'

import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/counter.css'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import { Button } from '@/components/ui/Button'
import { formatMoney } from '@/lib/shopify/format'
import type { Product, ShopImage } from '@/lib/shopify/types'
import { cn } from '@/lib/utils'

import { useCart } from './CartProvider'
import { flyToCart } from './flyToCart'
import { ArrowIcon, CloseIcon } from './icons'
import {
  OptionPicker,
  selectionOf,
  useAddedFlash,
  useVariantSelection,
} from './VariantOptions'

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

  const { selection, setSelection, variant, choose, isAvailable } =
    useVariantSelection(product.variants)

  // Google Shopping links to ?variant=<id>; start on that variant. Read
  // after load so the page itself can stay static.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('variant')
    const linked = id && product.variants.find(v => v.id.endsWith(`/${id}`))
    if (linked) setSelection(selectionOf(linked))
  }, [product.variants, setSelection])

  // Shopify's option order, without the "Default Title" of one-variant
  // products.
  const options = product.options
    .map(o => ({ name: o.name, values: o.optionValues.map(v => v.name) }))
    .filter(o => !(o.values.length === 1 && o.values[0] === 'Default Title'))

  const images = product.images.length
    ? product.images
    : product.featuredImage
      ? [product.featuredImage]
      : []
  const [imageUrl, setImageUrl] = useState(images[0]?.url)
  const current = images.find(i => i.url === imageUrl) ?? images[0]

  function pick(name: string, value: string) {
    const picked = choose(name, value)
    if (picked?.image) setImageUrl(picked.image.url)
  }

  const [added, flashAdded] = useAddedFlash()
  async function add() {
    if (!variant) return
    // Fly the photo to the cart while the request runs; it lands about
    // when the count updates.
    const flew = flyToCart(
      document.querySelector<HTMLImageElement>(
        '[data-product-photo] img[data-current]'
      )
    )
    if (await addItem(variant.id, { open: !flew })) flashAdded()
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

        <OptionPicker
          options={options}
          selection={selection}
          choose={pick}
          isAvailable={isAvailable}
          className='mt-6'
        />

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
              : added
                ? 'Added ✓'
                : isPending
                  ? 'Adding…'
                  : 'Add to cart'}
        </Button>
        {error && (
          <p role='alert' className='mt-2 text-sm font-semibold text-red-700'>
            {error}
          </p>
        )}

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

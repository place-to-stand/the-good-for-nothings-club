import Image from 'next/image'
import Link from 'next/link'

import { compareAtLabel, priceLabel, shopPaths } from '@/lib/shopify/format'
import type { ProductCard as ProductCardData } from '@/lib/shopify/types'
import { cn } from '@/lib/utils'

/** A product tile: image (second image on hover), title, price. */
export default function ProductCard({
  product,
  priority,
}: {
  product: ProductCardData
  /** Load the image eagerly; set on the first row of a grid. */
  priority?: boolean
}) {
  const [first, second] = product.images.length
    ? product.images
    : [product.featuredImage]
  const compareAt = compareAtLabel(product)

  return (
    <Link
      href={shopPaths.product(product.handle)}
      className='group flex w-full flex-col border-2 border-black bg-white hover:no-underline'
    >
      <div className='relative aspect-square overflow-hidden border-b-2 border-black'>
        {first && (
          <Image
            src={first.url}
            alt={first.altText ?? product.title}
            fill
            priority={priority}
            sizes='(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw'
            className={cn(
              'object-cover transition-opacity duration-300',
              second && 'group-hover:opacity-0'
            )}
          />
        )}
        {second && (
          <Image
            src={second.url}
            alt=''
            fill
            sizes='(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw'
            className='object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100'
          />
        )}
        {!product.availableForSale && (
          <span className='absolute top-2 left-2 bg-black px-2 py-1 text-xs font-bold tracking-[0.06em] text-white uppercase'>
            Sold out
          </span>
        )}
        {product.availableForSale && compareAt && (
          <span className='absolute top-2 left-2 bg-black px-2 py-1 text-xs font-bold tracking-[0.06em] text-white uppercase'>
            Sale
          </span>
        )}
      </div>
      <div className='flex flex-1 flex-col gap-1 p-3 md:p-4'>
        <h3 className='text-base leading-tight font-extrabold tracking-[-0.01em] md:text-lg'>
          <span className='link-line'>{product.title}</span>
        </h3>
        <p className='mt-auto text-sm font-semibold md:text-base'>
          {priceLabel(product)}
          {compareAt && (
            <s className='ml-2 font-normal text-black/50'>{compareAt}</s>
          )}
        </p>
      </div>
    </Link>
  )
}

export function ProductGrid({
  products,
  className,
}: {
  products: ProductCardData[]
  className?: string
}) {
  return (
    <ul
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4',
        className
      )}
    >
      {products.map((product, i) => (
        <li key={product.id} className='flex'>
          <ProductCard product={product} priority={i < 4} />
        </li>
      ))}
    </ul>
  )
}

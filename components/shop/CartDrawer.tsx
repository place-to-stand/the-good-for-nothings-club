'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { shopCopy } from '@/data/shop'
import { formatMoney, shopPaths } from '@/lib/shopify/format'
import type { CartLine } from '@/lib/shopify/types'
import { cn } from '@/lib/utils'

import { useCart } from './CartProvider'
import { BagIcon, CloseIcon, MinusIcon, PlusIcon } from './icons'

/** Bag icon with the item count tucked onto its corner. */
function BagWithCount({ count }: { count: number }) {
  return (
    <span className='relative inline-flex'>
      <BagIcon size={22} />
      {count > 0 && (
        <span
          // Re-keyed on each change so the badge pops when items are added.
          key={count}
          className='outline-background absolute -top-2 -right-3.5 flex h-[18px] min-w-[18px] items-center justify-center bg-black px-1 text-[11px] leading-none font-extrabold text-white tabular-nums outline-2 motion-safe:animate-[badge-pop_500ms_var(--ease-spring)]'
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </span>
  )
}

const cartLabel = (count: number) =>
  `Open cart, ${count} ${count === 1 ? 'item' : 'items'}`

/** Cart button for the shop bar. */
export function CartButton({ className }: { className?: string }) {
  const { cart, setOpen } = useCart()
  const count = cart?.totalQuantity ?? 0

  return (
    <button
      type='button'
      onClick={() => setOpen(true)}
      className={cn(
        'flex w-14 cursor-pointer items-center justify-center transition-colors hover:bg-black/10 active:bg-black/20',
        className
      )}
      aria-label={cartLabel(count)}
    >
      <BagWithCount count={count} />
    </button>
  )
}

/**
 * Off the shop pages, a cart with something in it floats in the bottom
 * right corner, sliding in from the edge.
 */
export function FloatingCart() {
  const { cart, isOpen, setOpen } = useCart()
  const pathname = usePathname()
  const count = cart?.totalQuantity ?? 0
  if (!count || isOpen || pathname.startsWith('/shop')) return null

  return (
    <button
      type='button'
      onClick={() => setOpen(true)}
      aria-label={cartLabel(count)}
      className='bg-background fixed right-4 bottom-4 z-40 flex size-16 cursor-pointer items-center justify-center border-2 border-black transition-colors hover:bg-[color-mix(in_oklab,var(--background),black_10%)] motion-safe:animate-[cart-float-in_800ms_var(--ease-spring)] md:right-8 md:bottom-8'
    >
      <BagWithCount count={count} />
    </button>
  )
}

/** Slide-out cart. Checkout hands off to Shopify's own checkout page. */
export default function CartDrawer() {
  const { cart, isOpen, setOpen, isPending, error, setQuantity } = useCart()
  const lines = cart?.lines ?? []

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side='right'
        className='flex w-full flex-col gap-0 border-l-2 border-black p-0 sm:max-w-md'
      >
        <SheetHeader className='border-b-2 border-black p-5 text-left'>
          <SheetTitle className='text-2xl font-black uppercase'>
            {shopCopy.cart.title}
          </SheetTitle>
          <SheetDescription className='sr-only'>
            Items in your cart and a link to check out.
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className='flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center'>
            <p className='font-serif text-2xl'>{shopCopy.cart.empty}</p>
            <Button asChild variant='outline' onClick={() => setOpen(false)}>
              <Link href={shopPaths.all}>{shopCopy.cart.keepShopping}</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul
              className={cn(
                'flex-1 divide-y-2 divide-black overflow-y-auto transition-opacity',
                isPending && 'opacity-60'
              )}
            >
              {lines.map(line => (
                <CartLineRow
                  key={line.id}
                  line={line}
                  disabled={isPending}
                  onQuantity={q => setQuantity(line.id, q)}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </ul>

            <div className='border-t-2 border-black p-5'>
              {error && (
                <p
                  role='alert'
                  className='mb-3 text-sm font-semibold text-red-700'
                >
                  {error}
                </p>
              )}
              <div className='flex items-baseline justify-between font-bold uppercase'>
                <span>{shopCopy.cart.subtotal}</span>
                <span>{cart && formatMoney(cart.cost.subtotalAmount)}</span>
              </div>
              <p className='mt-1 text-sm text-black/70'>
                {shopCopy.cart.shippingNote}
              </p>
              <Button asChild className='mt-4 w-full' size='lg'>
                <a
                  href={cart?.checkoutUrl}
                  aria-disabled={isPending}
                  className={cn(isPending && 'pointer-events-none opacity-60')}
                >
                  {shopCopy.cart.checkout}
                </a>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function CartLineRow({
  line,
  disabled,
  onQuantity,
  onNavigate,
}: {
  line: CartLine
  disabled: boolean
  onQuantity: (quantity: number) => void
  onNavigate: () => void
}) {
  const { merchandise } = line
  const image = merchandise.image ?? merchandise.product.featuredImage
  const options = merchandise.selectedOptions
    .filter(o => o.value !== 'Default Title')
    .map(o => o.value)
    .join(' / ')

  return (
    <li className='flex gap-4 p-5'>
      <Link
        href={shopPaths.product(merchandise.product.handle)}
        onClick={onNavigate}
        className='relative aspect-square w-20 shrink-0 border-2 border-black bg-white'
      >
        {image && (
          <Image
            src={image.url}
            alt={image.altText ?? merchandise.product.title}
            fill
            sizes='80px'
            className='object-cover'
          />
        )}
      </Link>
      <div className='flex min-w-0 flex-1 flex-col'>
        <div className='flex items-start gap-2'>
          <Link
            href={shopPaths.product(merchandise.product.handle)}
            onClick={onNavigate}
            className='flex-1 leading-tight font-bold'
          >
            {merchandise.product.title}
          </Link>
          <button
            type='button'
            disabled={disabled}
            onClick={() => onQuantity(0)}
            aria-label={`Remove ${merchandise.product.title}`}
            className='-mt-1 -mr-1 flex size-7 shrink-0 cursor-pointer items-center justify-center hover:bg-black/10 disabled:cursor-default'
          >
            <CloseIcon size={16} />
          </button>
        </div>
        {options && <p className='text-sm text-black/70'>{options}</p>}
        <div className='mt-auto flex items-center justify-between pt-2'>
          <div className='flex items-center border-2 border-black'>
            <button
              type='button'
              disabled={disabled}
              onClick={() => onQuantity(line.quantity - 1)}
              className='flex h-8 w-8 cursor-pointer items-center justify-center hover:bg-black/10 disabled:cursor-default'
              aria-label='One fewer'
            >
              <MinusIcon size={16} />
            </button>
            <span className='w-8 text-center font-semibold' aria-live='polite'>
              {line.quantity}
            </span>
            <button
              type='button'
              disabled={disabled}
              onClick={() => onQuantity(line.quantity + 1)}
              className='flex h-8 w-8 cursor-pointer items-center justify-center hover:bg-black/10 disabled:cursor-default'
              aria-label='One more'
            >
              <PlusIcon size={16} />
            </button>
          </div>
          <span className='font-semibold'>
            {formatMoney(line.cost.totalAmount)}
          </span>
        </div>
      </div>
    </li>
  )
}

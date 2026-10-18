'use client'

import { Minus, Plus, ShoppingBag } from 'lucide-react'
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

/**
 * Header cart button. Shows on shop pages, and anywhere else once the
 * cart has something in it.
 */
export function CartButton({ className }: { className?: string }) {
  const { cart, setOpen } = useCart()
  const pathname = usePathname()
  const count = cart?.totalQuantity ?? 0
  if (!count && !pathname.startsWith('/shop')) return null

  return (
    <button
      type='button'
      onClick={() => setOpen(true)}
      className={cn(
        'relative flex cursor-pointer items-center justify-center transition-colors hover:bg-black/10 active:bg-black/20',
        className
      )}
      aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`}
    >
      <ShoppingBag height='26px' width='26px' />
      {count > 0 && (
        <span className='absolute top-2 right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] leading-none font-bold text-white'>
          {count}
        </span>
      )}
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
            className='object-contain'
          />
        )}
      </Link>
      <div className='flex min-w-0 flex-1 flex-col'>
        <Link
          href={shopPaths.product(merchandise.product.handle)}
          onClick={onNavigate}
          className='leading-tight font-bold'
        >
          {merchandise.product.title}
        </Link>
        {options && <p className='text-sm text-black/70'>{options}</p>}
        <div className='mt-auto flex items-center justify-between pt-2'>
          <div className='flex items-center border-2 border-black'>
            <button
              type='button'
              disabled={disabled}
              onClick={() => onQuantity(line.quantity - 1)}
              className='flex h-8 w-8 cursor-pointer items-center justify-center hover:bg-black/10 disabled:cursor-default'
              aria-label={line.quantity === 1 ? 'Remove' : 'One fewer'}
            >
              <Minus size={16} />
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
              <Plus size={16} />
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

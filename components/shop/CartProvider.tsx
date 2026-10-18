'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from 'react'

import {
  addItem as addItemAction,
  loadCart,
  setLineQuantity as setLineQuantityAction,
  type CartResult,
} from '@/lib/shopify/cartActions'
import { CART_COOKIE } from '@/lib/shopify/format'
import type { Cart } from '@/lib/shopify/types'

type CartContextValue = {
  cart: Cart | null
  isOpen: boolean
  setOpen: (open: boolean) => void
  /** True while a cart change is on its way to Shopify. */
  isPending: boolean
  error: string | null
  addItem: (variantId: string) => Promise<boolean>
  setQuantity: (lineId: string, quantity: number) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside <CartProvider>')
  return value
}

/**
 * Holds the visitor's Shopify cart for the whole site, so the header's
 * cart button and the cart drawer work on every page, not only /shop.
 * The cart is fetched in the browser after load, which keeps every page
 * static.
 */
export default function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isOpen, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const apply = useCallback((result: CartResult) => {
    setError(result.error ?? null)
    if (!result.error) setCart(result.cart)
    return !result.error
  }, [])

  useEffect(() => {
    if (!document.cookie.split('; ').some(c => c.startsWith(`${CART_COOKIE}=`)))
      return
    loadCart().then(apply)
  }, [apply])

  const addItem = useCallback(
    (variantId: string) =>
      new Promise<boolean>(resolve => {
        startTransition(async () => {
          const ok = apply(await addItemAction(variantId))
          if (ok) setOpen(true)
          resolve(ok)
        })
      }),
    [apply]
  )

  const setQuantity = useCallback(
    (lineId: string, quantity: number) => {
      startTransition(async () => {
        apply(await setLineQuantityAction(lineId, quantity))
      })
    },
    [apply]
  )

  const value = useMemo(
    () => ({
      cart,
      isOpen,
      setOpen,
      isPending,
      error,
      addItem,
      setQuantity,
    }),
    [cart, isOpen, isPending, error, addItem, setQuantity]
  )

  return <CartContext value={value}>{children}</CartContext>
}

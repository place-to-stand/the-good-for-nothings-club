'use server'

import { cookies, headers } from 'next/headers'

import {
  addToCart,
  createCart,
  getCart,
  isShopifyConfigured,
  removeCartLine,
  updateCartLine,
} from '.'
import { CART_COOKIE } from './format'
import type { Cart } from './types'

/**
 * Cart server actions, called from components/shop/CartProvider.
 *
 * The cart id lives in a first-party cookie. It is readable from the
 * browser on purpose: CartProvider checks for it before asking the server
 * for a cart, so visitors who never touch the shop make no cart calls.
 */

const TWO_WEEKS = 60 * 60 * 24 * 14

export type CartResult = { cart: Cart | null; error?: string }

async function buyerIp() {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip')
}

async function cartId() {
  return (await cookies()).get(CART_COOKIE)?.value
}

async function saveCart(cart: Cart | null) {
  const jar = await cookies()
  if (cart) {
    jar.set(CART_COOKIE, cart.id, {
      path: '/',
      maxAge: TWO_WEEKS,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  } else {
    jar.delete(CART_COOKIE)
  }
  return cart
}

async function run(work: () => Promise<Cart | null>): Promise<CartResult> {
  if (!isShopifyConfigured()) return { cart: null, error: 'Shop is offline.' }
  try {
    return { cart: await work() }
  } catch (error) {
    console.error('cart action failed', error)
    return {
      cart: null,
      error: 'Something went wrong with the cart. Please try again.',
    }
  }
}

export async function loadCart(): Promise<CartResult> {
  return run(async () => {
    const id = await cartId()
    if (!id) return null
    // An expired or completed cart comes back null: forget it.
    const cart = await getCart(id, await buyerIp())
    if (!cart) await saveCart(null)
    return cart
  })
}

export async function addItem(
  merchandiseId: string,
  quantity = 1
): Promise<CartResult> {
  return run(async () => {
    const id = await cartId()
    const ip = await buyerIp()
    const lines = [{ merchandiseId, quantity }]
    const existing = id ? await getCart(id, ip) : null
    const cart = existing
      ? await addToCart(existing.id, lines, ip)
      : await createCart(lines, ip)
    return saveCart(cart)
  })
}

export async function setLineQuantity(
  lineId: string,
  quantity: number
): Promise<CartResult> {
  return run(async () => {
    const id = await cartId()
    if (!id) return null
    const ip = await buyerIp()
    const cart =
      quantity > 0
        ? await updateCartLine(id, { id: lineId, quantity }, ip)
        : await removeCartLine(id, lineId, ip)
    return cart
  })
}

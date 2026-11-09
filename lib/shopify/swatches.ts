/**
 * Color swatches for the shop. Shopify only has swatches set on a few
 * products, so the colors live here, keyed by the option value's name.
 * Add a line when a new color shows up in the store; a color missing
 * here shows as a plain name button instead of a swatch.
 * Safe to import from client components.
 */

const SWATCHES: Record<string, string> = {
  // Comfort Colors tees
  black: '#1c1c1c',
  pepper: '#5e5b57',
  'true navy': '#2d3550',
  denim: '#5b6d84',
  'washed denim': '#94a8be',
  violet: '#9b8dc4',
  blossom: '#f2c3cd',
  white: '#f7f6f1',
  crimson: '#b27070',
  // Dad hats
  stone: '#d6cdb8',
  pink: '#f2c4cc',
  'light blue': '#b8d0e6',
}

/** True for the option or filter that holds colors. */
export const isColorName = (name: string) => /^colou?rs?$/i.test(name.trim())

/** The swatch color for a value such as "True Navy", if there is one. */
export const swatchOf = (value: string): string | undefined =>
  SWATCHES[value.trim().toLowerCase()]

/** Light swatches need a dark check mark on top; dark ones a white one. */
export function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}

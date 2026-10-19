'use client'

import { useState } from 'react'

import type { SelectedOption } from '@/lib/shopify/types'
import { cn } from '@/lib/utils'

/** Anything with options, from a full variant to a card's quick variant. */
type VariantLike = {
  id: string
  availableForSale: boolean
  selectedOptions: SelectedOption[]
}

export type Selection = Record<string, string>

export type OptionGroup = { name: string; values: string[] }

const matches = (variant: VariantLike, selection: Selection) =>
  variant.selectedOptions.every(o => selection[o.name] === o.value)

export const selectionOf = (variant: VariantLike): Selection =>
  Object.fromEntries(variant.selectedOptions.map(o => [o.name, o.value]))

/**
 * Option groups (Color, Size...) in the order the variants list them,
 * leaving out the "Title: Default Title" that single-variant products have.
 */
export function optionsOf(variants: VariantLike[]): OptionGroup[] {
  const groups = new Map<string, string[]>()
  for (const v of variants)
    for (const o of v.selectedOptions) {
      const values = groups.get(o.name) ?? []
      if (!values.includes(o.value)) values.push(o.value)
      groups.set(o.name, values)
    }
  return [...groups]
    .map(([name, values]) => ({ name, values }))
    .filter(g => !(g.values.length === 1 && g.values[0] === 'Default Title'))
}

/** Which variant the shopper has picked, starting on the first in stock. */
export function useVariantSelection<V extends VariantLike>(variants: V[]) {
  const first = variants.find(v => v.availableForSale) ?? variants[0]
  const [selection, setSelection] = useState<Selection>(() =>
    first ? selectionOf(first) : {}
  )
  const variant = variants.find(v => matches(v, selection))

  /** Picks a value. If that combination doesn't exist, keeps the new
   *  value and takes the first variant that has it. Returns the variant. */
  function choose(name: string, value: string) {
    const next = { ...selection, [name]: value }
    const picked =
      variants.find(v => matches(v, next)) ??
      variants.find(v =>
        v.selectedOptions.some(o => o.name === name && o.value === value)
      )
    setSelection(picked ? selectionOf(picked) : next)
    return picked
  }

  const isAvailable = (name: string, value: string) =>
    variants.some(
      v => v.availableForSale && matches(v, { ...selection, [name]: value })
    )

  return { selection, setSelection, variant, choose, isAvailable }
}

/** A row of square buttons per option, as on the product page. */
export function OptionPicker({
  options,
  selection,
  choose,
  isAvailable,
  className,
}: {
  options: OptionGroup[]
  selection: Selection
  choose: (name: string, value: string) => void
  isAvailable: (name: string, value: string) => boolean
  className?: string
}) {
  return options.map(option => (
    <fieldset key={option.name} className={className}>
      <legend className='text-sm font-bold tracking-[0.06em] uppercase'>
        {option.name}
        <span className='ml-2 font-normal normal-case'>
          {selection[option.name]}
        </span>
      </legend>
      <div className='mt-2 flex flex-wrap gap-2'>
        {option.values.map(value => {
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
                selected ? 'bg-black text-white' : 'bg-white hover:bg-black/10',
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
  ))
}

/** Add-to-cart label: says "Added" for a moment after it works. */
export function useAddedFlash() {
  const [added, setAdded] = useState(false)
  const flash = () => {
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }
  return [added, flash] as const
}

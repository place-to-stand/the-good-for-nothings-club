'use client'

import { forwardRef } from 'react'

import { Input } from './Input'

/**
 * Mask a US number as (512) 555-1234 while typing. Numbers starting
 * with + are international and stay free-form (phoneSchema allows both).
 * Grouping punctuation is only added once the next digit exists, so
 * backspacing never gets stuck re-inserting what was just deleted.
 */
export function formatPhone(raw: string): string {
  if (raw.trim().startsWith('+')) return raw
  let digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1)
  digits = digits.slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

const PhoneInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ onChange, ...props }, ref) => (
  <Input
    type='tel'
    autoComplete='tel'
    ref={ref}
    {...props}
    onChange={event => {
      event.target.value = formatPhone(event.target.value)
      onChange?.(event)
    }}
  />
))

PhoneInput.displayName = 'PhoneInput'

export { PhoneInput }

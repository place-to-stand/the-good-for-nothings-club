/**
 * Shop icons drawn to match the site's heavy, square type: thick strokes,
 * square ends and sharp corners.
 */

type IconProps = { size?: number; className?: string }

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.75,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
} as const

export function BagIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      aria-hidden='true'
      className={className}
      {...stroke}
    >
      <path d='M5.5 8.5h13v13h-13z' />
      <path d='M9 8.5V3.5h6v5' />
    </svg>
  )
}

export function SearchIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      aria-hidden='true'
      className={className}
      {...stroke}
    >
      <circle cx='10' cy='10' r='6.5' />
      <path d='m15 15 5.5 5.5' />
    </svg>
  )
}

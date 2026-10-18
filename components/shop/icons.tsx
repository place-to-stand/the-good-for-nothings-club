/**
 * Shop icons drawn to match the site's heavy, square type: thick strokes,
 * square ends and sharp corners.
 */

type IconProps = { size?: number; className?: string }

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.5,
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
      <path d='M4.5 8.5h15v12h-15z' />
      <path d='M8.5 8.5v-5h7v5' />
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
      <circle cx='10.5' cy='10.5' r='6.5' />
      <path d='m15.5 15.5 5 5' />
    </svg>
  )
}

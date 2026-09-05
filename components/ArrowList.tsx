import { cn } from '@/lib/utils'

/** A square-capped right arrow, drawn to match the site's hard black line work. */
function ArrowIcon() {
  return (
    <svg
      viewBox='0 0 16 16'
      aria-hidden
      className='mt-[2px] size-3.5 shrink-0'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.25}
      strokeLinecap='square'
      strokeLinejoin='miter'
    >
      <path d='M2 8H13M8.5 3.5L13 8L8.5 12.5' />
    </svg>
  )
}

/** A vertical list with an arrow for a bullet - one line per item. */
export default function ArrowList({
  items,
  className,
}: {
  items: string[]
  className?: string
}) {
  return (
    <ul
      className={cn(
        'flex flex-col gap-[7px] font-sans text-sm font-medium',
        className
      )}
    >
      {items.map(item => (
        <li key={item} className='flex items-start gap-2 leading-tight'>
          <ArrowIcon />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * The tinted small-caps label bar that groups rows inside a card —
 * price menu groups, tier perk headers, and the like.
 */
export default function GroupLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        '-mx-2 mb-1.5 flex items-center gap-3 border border-black/8 bg-black/5 px-2 py-1 text-xs font-extrabold tracking-[0.08em] text-black/80 uppercase',
        className
      )}
    >
      {children}
    </div>
  )
}

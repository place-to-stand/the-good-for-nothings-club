'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentProps, MouseEvent } from 'react'

/**
 * next/link does nothing when the target route is the one you're already
 * on — this wrapper scrolls back to the top instead, so nav links always
 * respond to a click.
 */
export default function ScrollTopLink({
  href,
  onClick,
  ...props
}: ComponentProps<typeof Link>) {
  const pathname = usePathname()

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (typeof href === 'string' && href === pathname) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return <Link href={href} onClick={handleClick} {...props} />
}

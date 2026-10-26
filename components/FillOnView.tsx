'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Hollow letters that fill in solid as you scroll down to them and empty
 * again as you scroll back up: the words start as an outline (said, not
 * done) and become real. Where the browser can tie animation to scrolling,
 * globals.css does it all; this observer is the fallback for the rest.
 * Visitors who ask for reduced motion see the filled words straight away.
 */
export default function FillOnView({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [filled, setFilled] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        // Fill on the way in; empty only once it drops back below the
        // screen (scrolling up), not when it scrolls off the top.
        if (entry.isIntersecting) setFilled(true)
        else if (entry.boundingClientRect.top > 0) setFilled(false)
      },
      { threshold: 1, rootMargin: '0px 0px -15% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <span ref={ref} className='fill-on-view' data-filled={filled}>
      {children}
    </span>
  )
}

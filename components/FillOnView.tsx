'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Hollow letters that fill in solid once they scroll into view: the words
 * start as an outline (said, not done) and become real. Visitors who ask
 * for reduced motion see the filled words straight away (see globals.css).
 */
export default function FillOnView({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [filled, setFilled] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setFilled(true)
          observer.disconnect()
        }
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

'use client'

import Link from 'next/link'
import { cn } from '../lib/utils'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'

type MenuItem = {
  href: string
  text: string
  // Shown inline (outside the hamburger) on small screens. Keep this to two
  // conversion-focused items so the compact bar stays a tidy "hamburger + 2".
  showOnMobile?: boolean
}

// Projects is intentionally omitted from the nav for now (the /projects route
// still works and is linked from the footer). The space-sustaining pages —
// Facilities, Services, Events — take its place.
const MENU_ITEMS: MenuItem[] = [
  { href: '/', text: 'Home' },
  { href: '/facilities', text: 'Facilities' },
  { href: '/services', text: 'Services' },
  { href: '/events', text: 'Events' },
  { href: '/membership', text: 'Membership', showOnMobile: true },
  { href: 'https://shop.thegoodfornothings.club/', text: 'Shop' },
  { href: '/about', text: 'About' },
  { href: '/contact', text: 'Contact', showOnMobile: true },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className='relative text-center font-sans font-black uppercase md:px-8 md:pt-8 xl:px-16 xl:pt-16'>
      <div className='bg-background relative z-10 m-auto grid max-w-(--page-max-width) grid-cols-[64px_1fr_1fr] border-b-2 border-black md:border-2 lg:grid-cols-8'>
        <Sheet key={pathname}>
          <SheetTrigger className='flex cursor-pointer items-center justify-center transition-colors hover:bg-black/10 active:bg-black/20 lg:hidden'>
            <Menu height='28px' width='28px' />
          </SheetTrigger>
          <SheetContent side='left'>
            <SheetHeader>
              <SheetTitle className='font-normal'>Menu</SheetTitle>
            </SheetHeader>
            <ul className='flex flex-col gap-4 py-12 font-sans text-3xl font-black uppercase'>
              {MENU_ITEMS.map(item => (
                <li key={item.href}>
                  <SheetClose asChild>
                    <Link
                      href={item.href}
                      className='block'
                      aria-current={pathname === item.href ? 'page' : undefined}
                    >
                      {item.text}
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>
          </SheetContent>
        </Sheet>

        {MENU_ITEMS.map(item => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                !item.showOnMobile && 'hidden lg:block',
                isActive && 'bg-black/5',
                'relative overflow-hidden border-black px-4 py-5 transition-all duration-500 not-first-of-type:border-l-2 hover:bg-black/10 hover:no-underline active:bg-black/20 md:border-b-0 md:px-5 md:py-6 lg:px-2 lg:text-sm xl:px-3 xl:text-base'
              )}
            >
              {item.text}
            </Link>
          )
        })}
      </div>
    </header>
  )
}

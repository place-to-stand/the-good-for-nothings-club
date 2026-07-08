'use client'

import ScrollTopLink from './ScrollTopLink'
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

// The wordmark is the Home link; the Join chip is a second door to
// /membership. Projects stays out of the nav for now (route still live).
const NAV_ITEMS = [
  { href: '/facilities', text: 'Facilities' },
  { href: '/services', text: 'Services' },
  { href: '/events', text: 'Events' },
  { href: '/membership', text: 'Membership' },
  { href: 'https://shop.thegoodfornothings.club/', text: 'Shop' },
  { href: '/about', text: 'About' },
  { href: '/contact', text: 'Contact' },
]

const SHEET_ITEMS = [{ href: '/', text: 'Home' }, ...NAV_ITEMS]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className='relative font-sans md:px-8 md:pt-8 xl:px-16 xl:pt-16'>
      <div className='bg-background relative z-10 m-auto flex max-w-(--page-max-width) items-stretch border-b-2 border-black md:border-2'>
        <Sheet key={pathname}>
          <SheetTrigger className='flex w-14 cursor-pointer items-center justify-center transition-colors hover:bg-black/10 active:bg-black/20 lg:hidden'>
            <Menu height='28px' width='28px' />
          </SheetTrigger>
          <SheetContent side='left'>
            <SheetHeader>
              <SheetTitle className='font-normal'>Menu</SheetTitle>
            </SheetHeader>
            <ul className='flex flex-col gap-4 py-12 font-sans text-3xl font-black uppercase'>
              {SHEET_ITEMS.map(item => (
                <li key={item.href}>
                  <SheetClose asChild>
                    <ScrollTopLink
                      href={item.href}
                      className='block'
                      aria-current={pathname === item.href ? 'page' : undefined}
                    >
                      {item.text}
                    </ScrollTopLink>
                  </SheetClose>
                </li>
              ))}
            </ul>
          </SheetContent>
        </Sheet>

        {/* Wordmark = home */}
        <ScrollTopLink
          href='/'
          aria-current={pathname === '/' ? 'page' : undefined}
          className={cn(
            'flex items-center px-4 py-4 transition-colors hover:bg-black/10 hover:no-underline active:bg-black/20 md:py-5 xl:px-6',
            pathname === '/' && 'lg:bg-black/5'
          )}
        >
          <span className='text-[18px] leading-[0.9] font-black tracking-[-0.02em] uppercase md:text-[22px]'>
            Good For
            <br />
            Nothings
          </span>
        </ScrollTopLink>

        {/* Desktop nav */}
        <nav className='hidden flex-1 items-center px-2 lg:flex xl:gap-1 xl:px-4'>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href

            return (
              <ScrollTopLink
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'px-2 py-3 text-sm font-extrabold tracking-[0.06em] uppercase transition-colors hover:bg-black/10 hover:no-underline active:bg-black/20 xl:px-3 xl:text-[15px]',
                  isActive && 'bg-black/5'
                )}
              >
                {item.text}
              </ScrollTopLink>
            )
          })}
        </nav>

        <div className='flex-1 lg:hidden' />

        {/* Membership CTA */}
        <div className='flex items-center px-3 md:px-4 lg:px-2 xl:px-4'>
          <ScrollTopLink
            href='/membership'
            aria-current={pathname === '/membership' ? 'page' : undefined}
            className='bg-black px-4 py-3 text-sm font-medium tracking-[0.06em] whitespace-nowrap text-white uppercase transition-colors hover:bg-black/80 hover:no-underline active:bg-black/70 xl:px-5'
          >
            Apply to Join
          </ScrollTopLink>
        </div>
      </div>
    </header>
  )
}

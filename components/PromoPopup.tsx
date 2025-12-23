'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'

const POPUP_DELAY = 1000
const PROMO_POPUP_KEY = 'promoPopupDismissedEvent'

type UpcomingEvent = {
  id: string
  title: string
  clientName: string
  slug: string
  mainLink?: string | null
  date: string
  summary: string
  projectUrl: string
  ctaUrl: string
  image?: {
    url: string
    width: number
    height: number
    lqip: string
    caption: string
  }
}

function getDismissalValue(event: UpcomingEvent) {
  return `${event.id}:${event.date}`
}

export default function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [event, setEvent] = useState<UpcomingEvent | null>(null)

  useEffect(() => {
    let isMounted = true
    let timer: ReturnType<typeof setTimeout>

    async function loadEvent() {
      try {
        const response = await fetch('/api/events/upcoming', {
          cache: 'no-store',
        })

        if (!response.ok) return

        const data: { event: UpcomingEvent | null } = await response.json()

        if (!isMounted || !data.event) return

        setEvent(data.event)

        const dismissedValue = localStorage.getItem(PROMO_POPUP_KEY)

        if (dismissedValue === getDismissalValue(data.event)) {
          return
        }

        timer = setTimeout(() => {
          if (isMounted) {
            setIsOpen(true)
          }
        }, POPUP_DELAY)
      } catch (error) {
        console.error('Failed to load promo event:', error)
      }
    }

    loadEvent()

    return () => {
      isMounted = false

      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [])

  const formattedDate = (() => {
    if (!event?.date) return null

    const utcDate = new Date(`${event.date}T00:00:00Z`)

    if (Number.isNaN(utcDate.getTime())) {
      return null
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(utcDate)
  })()

  const primaryHref = event?.ctaUrl ?? event?.projectUrl ?? '#'
  let primaryLabel = 'View Event Details'
  let primaryTarget: '_blank' | undefined
  let primaryRel: string | undefined

  if (primaryHref.startsWith('http')) {
    primaryTarget = '_blank'
    primaryRel = 'noopener noreferrer'

    try {
      primaryLabel = `RSVP Here`
    } catch (error) {
      console.error('Failed to parse event link hostname:', error)
      primaryLabel = 'Open Link'
    }
  }

  const showSecondaryLink = Boolean(
    event?.projectUrl && primaryHref !== event.projectUrl
  )

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && event) {
        localStorage.setItem(PROMO_POPUP_KEY, getDismissalValue(event))
      }

      setIsOpen(open)
    },
    [event]
  )

  const handleDismiss = useCallback(() => {
    handleOpenChange(false)
  }, [handleOpenChange])

  if (!event) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-3xl! overflow-y-auto border-black bg-white px-4 py-14 sm:p-10'>
        <div className='space-y-8'>
          <DialogHeader className='gap-1 text-center'>
            <DialogTitle className='text-[32px] leading-none font-black tracking-tight sm:text-[36px]'>
              {event.title}
            </DialogTitle>
            <DialogDescription className='font-sans text-xs text-black/75 uppercase md:text-sm'>
              {formattedDate
                ? `${formattedDate} • ${event.clientName}`
                : event.clientName}
            </DialogDescription>
          </DialogHeader>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            {event.image && (
              <div className='overflow-hidden border-2 border-black'>
                <Image
                  src={event.image.url}
                  alt={event.image.caption}
                  width={event.image.width}
                  height={event.image.height}
                  placeholder='blur'
                  blurDataURL={event.image.lqip}
                  className='h-auto w-full object-cover'
                />
              </div>
            )}
            <div className='flex flex-col justify-center gap-8 md:gap-10'>
              {event.summary && (
                <p className='font-sans text-[20px] leading-tight text-balance text-black/80'>
                  {event.summary}
                </p>
              )}
              <div className='flex flex-col justify-center gap-3'>
                {showSecondaryLink && (
                  <Button
                    asChild
                    variant='default'
                    size='lg'
                    className='hover:no-underline'
                  >
                    <Link href={event.projectUrl} onClick={handleDismiss}>
                      View Event Page
                    </Link>
                  </Button>
                )}
                <Button
                  asChild
                  size='lg'
                  variant='outline'
                  className='hover:no-underline'
                >
                  <Link
                    href={primaryHref}
                    target={primaryTarget}
                    rel={primaryRel}
                    onClick={handleDismiss}
                  >
                    {primaryLabel}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

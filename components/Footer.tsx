'use client'

import { Check, Loader2 } from 'lucide-react'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import SocialMediaLinks from './SocialMediaLinks'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { newsletterSignUpSchema } from '../data/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/Form'
import { Alert, AlertDescription, AlertTitle } from './ui/Alert'

function NewsletterSignUpForm() {
  const form = useForm<z.infer<typeof newsletterSignUpSchema>>({
    resolver: zodResolver(newsletterSignUpSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: z.infer<typeof newsletterSignUpSchema>) {
    const response = await fetch('/api/newsletter-sign-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...values }),
    })

    if (response.ok) {
      console.log('Success!')
    } else {
      console.error('Failed to subscribe')
    }
  }

  const { isSubmitting, isSubmitSuccessful } = form.formState

  return isSubmitSuccessful ? (
    <Alert>
      <Check className='h-4 w-4' />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Thank you for subscribing to our newsletter.{' '}
      </AlertDescription>
    </Alert>
  ) : (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex w-full'>
        <FormField
          name='email'
          control={form.control}
          render={({ field }) => (
            <FormItem className='grow'>
              <FormControl>
                <Input
                  type='email'
                  id='email'
                  required
                  maxLength={256}
                  autoComplete='email'
                  placeholder='Enter your email'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Subscribe
        </Button>
      </form>
    </Form>
  )
}

// Full site map. Projects lives here while it's out of the header nav;
// Membership gets the featured card instead of a list entry.
const FOOTER_LINKS = [
  { href: '/', text: 'Home' },
  { href: '/facilities', text: 'Facilities' },
  { href: '/services', text: 'Services' },
  { href: '/events', text: 'Events' },
  { href: 'https://shop.thegoodfornothings.club/', text: 'Shop' },
  { href: '/about', text: 'About' },
  { href: '/contact', text: 'Contact' },
  { href: '/projects', text: 'Projects' },
]

export default function Footer() {
  return (
    <footer className='pt-8 pb-8 font-sans md:px-8 md:pt-16 xl:px-16 xl:pb-16'>
      <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black md:border-x-2'>
        <div className='grid grid-cols-1 gap-10 px-4 py-8 md:px-12 md:py-12 lg:grid-cols-[auto_1fr_minmax(320px,420px)] lg:gap-16'>
          <div className='text-[22px] leading-[0.9] font-black tracking-[-0.02em] uppercase'>
            Good For
            <br />
            Nothings
          </div>
          <nav className='flex flex-col items-start gap-3'>
            {FOOTER_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className='text-[15px] font-extrabold tracking-[0.06em] uppercase'
              >
                {link.text}
              </Link>
            ))}
          </nav>
          <div className='space-y-8'>
            <div className='border-2 border-black p-6'>
              <h3 className='text-[20px] leading-none font-black tracking-[-0.02em] uppercase'>
                Membership
              </h3>
              <p className='mt-3 text-sm leading-snug'>
                Join the club, at your level. Apply anytime to join the
                waitlist — onboarding happens in waves as space opens up.
              </p>
              <Link
                href='/membership'
                className='mt-4 inline-flex bg-black px-5 py-3 text-sm font-black tracking-[0.06em] text-white uppercase transition-colors hover:bg-black/80 hover:no-underline active:bg-black/70'
              >
                Join
              </Link>
            </div>
            <div>
              <h3 className='text-[15px] font-black tracking-[0.06em] uppercase'>
                Newsletter
              </h3>
              <p className='mt-2 text-sm leading-snug'>
                Occasional updates from the clubhouse — events, openings, and
                new work.
              </p>
              <div className='mt-3'>
                <NewsletterSignUpForm />
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col-reverse items-center justify-between gap-4 border-t-2 border-black px-4 py-5 md:flex-row md:px-12'>
          <div className='text-center text-sm'>
            &copy; {new Date().getFullYear()} The Good for Nothings Club LLC.
            All rights reserved.
          </div>
          <div className='text-xl'>
            <SocialMediaLinks />
          </div>
        </div>
      </div>
    </footer>
  )
}

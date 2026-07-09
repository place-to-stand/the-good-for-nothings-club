'use client'

import { Check, Loader2 } from 'lucide-react'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import SocialMediaLinks from './SocialMediaLinks'
import ScrollTopLink from './ScrollTopLink'
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

// Site map, two columns. The wordmark covers Home. (/projects is still
// live, just unlinked.)
const FOOTER_LINKS = [
  { href: '/facilities', text: 'Facilities' },
  { href: '/services', text: 'Services' },
  { href: '/events', text: 'Events' },
  { href: '/membership', text: 'Membership' },
  { href: 'https://shop.thegoodfornothings.club/', text: 'Shop' },
  { href: '/about', text: 'About' },
  { href: '/contact', text: 'Contact' },
]

export default function Footer() {
  return (
    <footer className='pt-8 pb-8 font-sans md:px-8 md:pt-16 xl:px-16 xl:pb-16'>
      <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black md:border-x-2'>
        <div className='grid grid-cols-1 gap-12 px-4 py-8 md:px-12 md:py-12 lg:grid-cols-3 lg:gap-16'>
          <div>
            <ScrollTopLink
              href='/'
              className='inline-block text-[40px] leading-[0.9] font-black tracking-[-0.02em] uppercase hover:no-underline'
            >
              GFNC
            </ScrollTopLink>
            <nav className='mt-10 grid grid-flow-col grid-rows-4 justify-start gap-x-14 gap-y-2'>
              {FOOTER_LINKS.map(link => (
                <ScrollTopLink
                  key={link.href}
                  href={link.href}
                  className='text-[15px] font-extrabold tracking-[0.06em] uppercase'
                >
                  {link.text}
                </ScrollTopLink>
              ))}
            </nav>
          </div>
          <div>
            <h3 className='text-[20px] font-black tracking-[0.06em] uppercase'>
              Newsletter
            </h3>
            <p className='mt-2 text-sm leading-snug'>
              Occasional updates from the clubhouse — events, openings, and new
              work.
            </p>
            <div className='mt-4'>
              <NewsletterSignUpForm />
            </div>
          </div>
          <div>
            <h3 className='text-[20px] font-black tracking-[0.06em] uppercase'>
              Membership
            </h3>
            <p className='mt-2 text-sm leading-snug'>
              Join the club, at your level. Apply anytime to join the waitlist —
              onboarding happens in waves as space opens up.
            </p>
            <Button asChild className='mt-4 hover:no-underline'>
              <ScrollTopLink href='/membership'>Apply to Join</ScrollTopLink>
            </Button>
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

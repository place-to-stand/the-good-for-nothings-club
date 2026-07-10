'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

import { inquirySchema, type InquiryKind } from '../data/schemas'
import { Alert, AlertDescription, AlertTitle } from './ui/Alert'
import { Button } from './ui/Button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/Form'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'

const MESSAGE_LABELS: Record<InquiryKind, string> = {
  facility: 'When do you want to book, and what are you working on?',
  service: 'Tell us about the project',
  membership: 'Tell us about yourself and what you make',
  event: 'Anything we should know? (optional)',
}

const SUCCESS_COPY: Record<InquiryKind, string> = {
  facility: "Got it - we'll get back to you to confirm timing and details.",
  service: "Got it - we'll get back to you to talk through the project.",
  membership:
    "Application received. We accept in waves as space opens up - we'll be in touch.",
  event: "You're on the list - see you there.",
}

type InquiryFormProps = {
  kind: InquiryKind
  /** What this inquiry is about (facility/service/event/tier name). */
  item: string
  /** Render a selector instead of a fixed item, e.g. membership tiers. */
  itemOptions?: string[]
  itemLabel?: string
  submitLabel?: string
}

export default function InquiryForm({
  kind,
  item,
  itemOptions,
  itemLabel,
  submitLabel = 'Submit',
}: InquiryFormProps) {
  const form = useForm<z.infer<typeof inquirySchema>>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      kind,
      item,
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  })

  async function onSubmit(values: z.infer<typeof inquirySchema>) {
    const response = await fetch('/api/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (!response.ok) {
      form.setError('root', {
        message:
          'Something went wrong. Email us at hello@thegoodfornothings.club.',
      })
      throw new Error('Inquiry submission failed')
    }
  }

  const { isSubmitting, isSubmitSuccessful, errors } = form.formState

  return isSubmitSuccessful ? (
    <Alert>
      <Check className='h-4 w-4' />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>{SUCCESS_COPY[kind]}</AlertDescription>
    </Alert>
  ) : (
    <Form {...form}>
      <form
        onSubmit={e =>
          form
            .handleSubmit(onSubmit)(e)
            .catch(() => {})
        }
        className='space-y-4 text-left'
      >
        {itemOptions && (
          <FormField
            name='item'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='item'>{itemLabel ?? 'Level'}</FormLabel>
                <FormControl>
                  <select
                    id='item'
                    required
                    {...field}
                    className='border-input flex h-10 w-full cursor-pointer border-2 bg-transparent px-3 py-2 font-sans text-sm focus-visible:ring-1 focus-visible:outline-none'
                  >
                    {itemOptions.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          name='name'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor='name'>Name</FormLabel>
              <FormControl>
                <Input
                  type='text'
                  id='name'
                  required
                  maxLength={256}
                  autoComplete='name'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name='email'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor='email'>Email Address</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  id='email'
                  required
                  maxLength={256}
                  autoComplete='email'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name='phone'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor='phone'>Phone Number (optional)</FormLabel>
              <FormControl>
                <Input
                  type='tel'
                  id='phone'
                  maxLength={25}
                  autoComplete='tel'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name='message'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor='message'>{MESSAGE_LABELS[kind]}</FormLabel>
              <FormControl>
                <Textarea id='message' maxLength={4096} rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {errors.root && (
          <p className='text-destructive font-sans text-sm font-medium'>
            {errors.root.message}
          </p>
        )}
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {submitLabel}
        </Button>
      </form>
    </Form>
  )
}

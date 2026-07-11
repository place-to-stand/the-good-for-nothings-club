'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { events } from '../data/events'
import { phoneSchema, type InquiryKind } from '../data/schemas'
import { services } from '../data/services'
import { Alert, AlertDescription, AlertTitle } from './ui/Alert'
import { Button } from './ui/Button'
import { fieldLabelClassName, selectClassName } from './ui/fieldStyles'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/Form'
import { Input } from './ui/Input'
import { PhoneInput } from './ui/PhoneInput'
import { Textarea } from './ui/Textarea'

const GENERAL = 'general'

/** Common reasons people write in from the contact page. */
const GENERAL_SUBJECTS = [
  'Booking the clubhouse',
  'Hiring the club for a project',
  'Membership questions',
  'Press or partnerships',
  'Other',
]

/** Encode kind + item into a single select value. */
const encode = (kind: InquiryKind, item: string) => `${kind}|${item}`

function decode(value: string): { kind: InquiryKind; item: string } {
  if (value === GENERAL) return { kind: 'general', item: 'General' }
  const [kind, ...rest] = value.split('|')
  return { kind: kind as InquiryKind, item: rest.join('|') }
}

const MESSAGE_LABELS: Partial<Record<InquiryKind, string>> = {
  service: 'Tell us about the project',
  event: 'Anything we should know? (optional)',
  general: 'Your message',
}

const SUCCESS_COPY: Partial<Record<InquiryKind, string>> = {
  service: "Got it. We'll get back to you to talk through the project.",
  event: "You're on the list. See you there.",
  general: "Got it. We'll get back to you soon.",
}

const contactSchema = z.object({
  regarding: z.string().min(1),
  name: z.string().min(1).max(256),
  email: z.string().email(),
  phone: phoneSchema,
  message: z.string().max(5000).optional(),
})

type ContactValues = z.infer<typeof contactSchema>

type InquiryFormProps = {
  /** Where the form launched from; drives the Regarding preselection. */
  defaultKind?: InquiryKind
  /** The specific service or event, when launched from its card. */
  defaultItem?: string
  submitLabel?: string
  /** Fires when the Regarding selection changes, e.g. to retitle a dialog. */
  onSelectionChange?: (selection: { kind: InquiryKind; item: string }) => void
}

export default function InquiryForm({
  defaultKind = 'general',
  defaultItem,
  submitLabel = 'Send',
  onSelectionChange,
}: InquiryFormProps) {
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      regarding:
        defaultKind === 'general' || !defaultItem
          ? GENERAL
          : encode(defaultKind, defaultItem),
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  })

  const regarding = form.watch('regarding')
  const { kind } = decode(regarding)

  useEffect(() => {
    onSelectionChange?.(decode(regarding))
  }, [regarding, onSelectionChange])

  // Scope the Regarding menu to the launching surface: service dialogs
  // list services, RSVP dialogs list events, the contact page gets
  // general subject lines.
  const serviceOptions = services.map(service => (
    <option key={service.slug} value={encode('service', service.name)}>
      {service.name}
    </option>
  ))
  const eventOptions = events.map(event => (
    <option key={event.slug} value={encode('event', event.name)}>
      RSVP: {event.name}
    </option>
  ))

  async function onSubmit(values: ContactValues) {
    const { kind, item } = decode(values.regarding)
    const response = await fetch('/api/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind,
        item,
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        message: values.message || undefined,
      }),
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
      <AlertDescription>
        {SUCCESS_COPY[kind] ?? SUCCESS_COPY.general}
      </AlertDescription>
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
        <FormField
          name='regarding'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={fieldLabelClassName} htmlFor='regarding'>
                Regarding
              </FormLabel>
              <FormControl>
                <select
                  id='regarding'
                  required
                  {...field}
                  className={selectClassName}
                >
                  {defaultKind === 'general' && (
                    <>
                      <option value={GENERAL}>General</option>
                      {GENERAL_SUBJECTS.map(subject => (
                        <option
                          key={subject}
                          value={encode('general', subject)}
                        >
                          {subject}
                        </option>
                      ))}
                    </>
                  )}
                  {defaultKind === 'service' && serviceOptions}
                  {defaultKind === 'event' && eventOptions}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField
            name='name'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={fieldLabelClassName} htmlFor='name'>
                  Name
                </FormLabel>
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
            name='phone'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={fieldLabelClassName} htmlFor='phone'>
                  Phone Number (optional)
                </FormLabel>
                <FormControl>
                  <PhoneInput id='phone' maxLength={25} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name='email'
            control={form.control}
            render={({ field }) => (
              <FormItem className='sm:col-span-2'>
                <FormLabel className={fieldLabelClassName} htmlFor='email'>
                  Email Address
                </FormLabel>
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
        </div>
        <FormField
          name='message'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={fieldLabelClassName} htmlFor='message'>
                {MESSAGE_LABELS[kind] ?? MESSAGE_LABELS.general}
              </FormLabel>
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
        <Button type='submit' disabled={isSubmitting} className='mt-3'>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {submitLabel}
        </Button>
      </form>
    </Form>
  )
}

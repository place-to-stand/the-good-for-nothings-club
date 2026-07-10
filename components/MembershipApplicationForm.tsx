'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Loader2, X } from 'lucide-react'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import { facilities, storefrontCopy } from '../data/facilities'
import { membershipTiers } from '../data/membership'
import { phoneSchema, portfolioSchema } from '../data/schemas'
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

const NOT_SURE = 'Not sure yet'
const MAX_SOCIALS = 5

const applicationSchema = z.object({
  tier: z.string().min(1),
  offering: z.string().max(256),
  name: z.string().min(1).max(256),
  email: z.string().email(),
  phone: phoneSchema,
  socials: z
    .array(z.object({ handle: z.string().trim().max(100) }))
    .max(MAX_SOCIALS),
  portfolio: portfolioSchema,
  references: z.string().refine(value => ['Yes', 'No'].includes(value), {
    message: 'Select yes or no.',
  }),
  message: z.string().max(5000).optional(),
})

type ApplicationValues = z.infer<typeof applicationSchema>

/** The tier-specific follow-up: which offer is this application for? */
function offeringConfig(tier: string) {
  if (tier === 'Member') {
    return {
      label: 'Which monthly rental?',
      options: facilities
        .filter(f => f.model === 'monthly' && f.status !== 'planned')
        .map(f => f.name),
    }
  }
  if (tier === 'Associate') {
    return {
      label: 'Which hourly rental or shop?',
      options: [
        ...facilities
          .filter(f => f.model === 'hourly' && f.status !== 'planned')
          .map(f => f.name),
        storefrontCopy.name,
      ],
    }
  }
  return null
}

const selectClassName =
  'border-input flex h-10 w-full cursor-pointer border-2 bg-transparent px-3 py-2 font-sans text-sm focus-visible:ring-1 focus-visible:outline-none'

type MembershipApplicationFormProps = {
  /** Preselected tier, e.g. from a facilities card. */
  defaultTier?: string
  /** Preselected offering; must belong to the default tier's options. */
  defaultOffering?: string
}

export default function MembershipApplicationForm({
  defaultTier,
  defaultOffering,
}: MembershipApplicationFormProps) {
  const form = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      tier: defaultTier ?? membershipTiers[0].name,
      offering: defaultOffering ?? NOT_SURE,
      name: '',
      email: '',
      phone: '',
      socials: [{ handle: '' }],
      portfolio: '',
      references: '',
      message: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'socials',
  })

  const tier = form.watch('tier')
  const offering = form.watch('offering')
  const config = offeringConfig(tier)

  // Keep the offering valid for the selected tier.
  useEffect(() => {
    if (config && offering !== NOT_SURE && !config.options.includes(offering)) {
      form.setValue('offering', NOT_SURE)
    }
  }, [config, offering, form])

  async function onSubmit(values: ApplicationValues) {
    const response = await fetch('/api/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'membership',
        item: values.tier,
        offering:
          config && values.offering !== NOT_SURE ? values.offering : undefined,
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        socials: values.socials
          .map(social => social.handle.trim())
          .filter(Boolean),
        portfolio: values.portfolio || undefined,
        references: values.references,
        message: values.message || undefined,
      }),
    })

    if (!response.ok) {
      form.setError('root', {
        message:
          'Something went wrong. Email us at hello@thegoodfornothings.club.',
      })
      throw new Error('Application submission failed')
    }
  }

  const { isSubmitting, isSubmitSuccessful, errors } = form.formState

  return isSubmitSuccessful ? (
    <Alert>
      <Check className='h-4 w-4' />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Application received. We accept in waves as space opens up — we&apos;ll
        be in touch.
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
          name='tier'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor='tier'>Membership level</FormLabel>
              <FormControl>
                <select
                  id='tier'
                  required
                  {...field}
                  className={selectClassName}
                >
                  {membershipTiers.map(option => (
                    <option key={option.slug} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {config && (
          <FormField
            name='offering'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='offering'>{config.label}</FormLabel>
                <FormControl>
                  <select id='offering' {...field} className={selectClassName}>
                    <option value={NOT_SURE}>{NOT_SURE}</option>
                    {config.options.map(option => (
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
        <div>
          <FormLabel>Social links (optional)</FormLabel>
          <div className='mt-2 space-y-2'>
            {fields.map((socialField, index) => (
              <FormField
                key={socialField.id}
                name={`socials.${index}.handle`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='flex items-center gap-2'>
                        <Input
                          type='text'
                          maxLength={100}
                          placeholder='https://'
                          aria-label={`Social link ${index + 1}`}
                          {...field}
                        />
                        {index > 0 && (
                          <button
                            type='button'
                            aria-label={`Remove social link ${index + 1}`}
                            onClick={() => remove(index)}
                            className='cursor-pointer p-1 transition-colors hover:bg-black/10'
                          >
                            <X className='h-4 w-4' />
                          </button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          {fields.length < MAX_SOCIALS && (
            <button
              type='button'
              onClick={() => append({ handle: '' })}
              className='mt-2 cursor-pointer font-sans text-xs font-extrabold tracking-[0.08em] uppercase underline underline-offset-2'
            >
              + Add another
            </button>
          )}
        </div>
        <FormField
          name='portfolio'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor='portfolio'>Portfolio (optional)</FormLabel>
              <FormControl>
                <Input
                  type='url'
                  id='portfolio'
                  maxLength={256}
                  placeholder='https://'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name='references'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                If needed, would you be able to provide references?
              </FormLabel>
              <FormControl>
                <div className='flex gap-6 pt-1'>
                  {['Yes', 'No'].map(option => (
                    <label
                      key={option}
                      className='flex cursor-pointer items-center gap-2 font-sans text-sm'
                    >
                      <input
                        type='radio'
                        name={field.name}
                        value={option}
                        checked={field.value === option}
                        onChange={() => field.onChange(option)}
                        className='h-4 w-4 cursor-pointer accent-black'
                      />
                      {option}
                    </label>
                  ))}
                </div>
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
              <FormLabel htmlFor='message'>
                Tell us about yourself and what you make
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
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Apply
        </Button>
      </form>
    </Form>
  )
}

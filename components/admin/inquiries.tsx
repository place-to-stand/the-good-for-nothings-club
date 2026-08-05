'use client'

import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { selectClassName } from '@/components/ui/fieldStyles'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import {
  INQUIRY_KINDS,
  MEMBER_ROLES,
  MEMBER_ROLE_LABELS,
  PIPELINE_FOR_KIND,
  PIPELINE_STATUSES,
  normalizeInquiryStatus,
  type InquiryKind,
  type InquiryStatus,
  type MemberRole,
  type Pipeline,
} from '@/data/schemas'
import { cn } from '@/lib/utils'

/**
 * Shared building blocks for the inquiry boards: the row table, the
 * detail/add sheet, and the small field editors inside them. Used by the
 * admin dashboard (to-do queue) and the per-board pages.
 */

export const DAY = 24 * 60 * 60 * 1000

const dateInputClassName = cn(
  selectClassName,
  'h-8 w-36 cursor-text px-2 text-xs'
)

export function pipelineOf(kind: InquiryKind): Pipeline {
  return PIPELINE_FOR_KIND[kind]
}

/**
 * Per-board wording: a won service engagement isn't a "joined member",
 * and the two terminal stages say plainly who passed on whom.
 */
export function statusLabel(status: InquiryStatus, pipeline: Pipeline) {
  if (pipeline === 'services' && status === 'joined') return 'won'
  if (status === 'declined') return 'they passed'
  if (status === 'not_a_fit') return 'we passed'
  return status.replaceAll('_', ' ')
}

/** Ms epoch → the local YYYY-MM-DD a date input wants. */
function epochToDateInput(ms?: number) {
  if (!ms) return ''
  const date = new Date(ms)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** YYYY-MM-DD → ms epoch at local midnight. */
function dateInputToEpoch(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day).getTime()
}

function formatDay(ms: number) {
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

/** Whole-day gap between two stage changes, for the history rail. */
function stageGap(from: number, to: number) {
  const days = Math.round((to - from) / DAY)
  if (days <= 0) return 'same day'
  if (days === 1) return '1 day'
  if (days < 60) return `${days} days`
  return `${Math.round(days / 30)} months`
}

function timeAgo(ms: number) {
  const days = Math.floor((Date.now() - ms) / DAY)
  if (days <= 0) return 'today'
  if (days === 1) return '1d ago'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1mo ago' : `${months}mo ago`
}

function StatusSelect({
  inquiry,
  className,
}: {
  inquiry: Doc<'inquiries'>
  className?: string
}) {
  const setStatus = useMutation(api.admin.setInquiryStatus)
  const pipeline = pipelineOf(inquiry.kind)
  const options = PIPELINE_STATUSES[pipeline]
  const value = normalizeInquiryStatus(inquiry.status)

  return (
    <select
      value={value}
      onChange={event =>
        setStatus({ id: inquiry._id, status: event.target.value as InquiryStatus })
      }
      onClick={event => event.stopPropagation()}
      className={cn(
        selectClassName,
        'h-8 w-auto px-1.5 py-0 text-xs font-semibold uppercase',
        className
      )}
      aria-label='Inquiry status'
    >
      {options.map(option => (
        <option key={option} value={option}>
          {statusLabel(option, pipeline)}
        </option>
      ))}
      {/* A row can hold a stage outside its board's ladder (e.g. imported
          data); keep the select truthful rather than silently remapping. */}
      {!options.includes(value) && <option value={value}>{value}</option>}
    </select>
  )
}

function DateField({
  id,
  field,
  value,
  label,
}: {
  id: Id<'inquiries'>
  field: 'tourAt' | 'touredAt' | 'joinedAt' | 'followUpAt'
  value?: number
  label: string
}) {
  const update = useMutation(api.admin.updateInquiryDetails)
  const overdue =
    field === 'followUpAt' &&
    value !== undefined &&
    value < new Date().setHours(0, 0, 0, 0)

  return (
    <label className='flex items-center justify-between gap-2'>
      <span
        className={cn(
          'font-sans text-xs font-semibold uppercase tracking-[1px]',
          overdue ? 'text-red-600' : 'text-black/60'
        )}
      >
        {label}
      </span>
      <input
        type='date'
        value={epochToDateInput(value)}
        onChange={event =>
          update({
            id,
            [field]: event.target.value
              ? dateInputToEpoch(event.target.value)
              : null,
          })
        }
        className={dateInputClassName}
        aria-label={label}
      />
    </label>
  )
}

function NotesEditor({ id, notes }: { id: Id<'inquiries'>; notes?: string }) {
  const update = useMutation(api.admin.updateInquiryDetails)
  const [draft, setDraft] = useState<string | null>(null)
  const dirty = draft !== null && draft !== (notes ?? '')

  return (
    <div>
      <Textarea
        value={draft ?? notes ?? ''}
        onChange={event => setDraft(event.target.value)}
        placeholder='Notes — date-prefix entries, e.g. "8/6 — toured, gets the etiquette stuff"'
        className='min-h-[120px]'
        aria-label='Inquiry notes'
      />
      {dirty && (
        <Button
          variant='outline'
          size='sm'
          className='mt-2'
          onClick={async () => {
            await update({ id, notes: draft ?? '' })
            setDraft(null)
          }}
        >
          Save notes
        </Button>
      )}
    </div>
  )
}

/** "utm_source / utm_medium / utm_campaign", else the referrer, else direct. */
function sourceLabel(attribution: {
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}) {
  if (attribution.utmSource) {
    return [attribution.utmSource, attribution.utmMedium, attribution.utmCampaign]
      .filter(Boolean)
      .join(' / ')
  }
  return attribution.referrer || 'direct'
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex gap-2 font-sans text-sm'>
      <dt className='shrink-0 font-semibold'>{label}:</dt>
      <dd className='break-all'>{value}</dd>
    </div>
  )
}

function RoleSelect({ inquiry }: { inquiry: Doc<'inquiries'> }) {
  const update = useMutation(api.admin.updateInquiryDetails)

  return (
    <label className='flex items-center justify-between gap-2'>
      <span className='font-sans text-xs font-semibold uppercase tracking-[1px] text-black/60'>
        Role
      </span>
      <select
        value={inquiry.memberRole ?? ''}
        onChange={event =>
          update({
            id: inquiry._id,
            memberRole: (event.target.value || null) as MemberRole | null,
          })
        }
        className={cn(
          selectClassName,
          'h-8 w-36 px-1.5 py-0 text-xs font-semibold uppercase'
        )}
        aria-label='Member role'
      >
        <option value=''>—</option>
        {MEMBER_ROLES.map(role => (
          <option key={role} value={role}>
            {MEMBER_ROLE_LABELS[role]}
          </option>
        ))}
      </select>
    </label>
  )
}

/** Body of the inquiry sheet: stage + dates + notes up top, context below. */
function InquirySheetBody({ id }: { id: Id<'inquiries'> }) {
  const inquiry = useQuery(api.admin.getInquiry, { id })

  if (inquiry === undefined) {
    return <p className='font-sans text-sm text-black/60'>Loading…</p>
  }
  if (inquiry === null) {
    return <p className='font-sans text-sm text-black/60'>Inquiry not found.</p>
  }

  const pipeline = pipelineOf(inquiry.kind)
  const status = normalizeInquiryStatus(inquiry.status)

  return (
    <div className='flex flex-col gap-5'>
      <div>
        <SheetTitle className='font-sans text-xl font-black uppercase tracking-[-0.02em]'>
          {inquiry.name}
          {inquiry.manual && (
            <span className='ml-2 inline-block border border-black/30 px-1 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-[1px] text-black/60'>
              manual
            </span>
          )}
        </SheetTitle>
        <SheetDescription className='font-sans text-sm text-black/70'>
          {inquiry.item}
          {inquiry.offering && ` — ${inquiry.offering}`} ·{' '}
          <span className='uppercase'>{inquiry.kind}</span>
        </SheetDescription>
      </div>

      <div className='flex flex-wrap items-center gap-x-6 gap-y-2'>
        <div className='flex items-center gap-3'>
          <span className='font-sans text-xs font-semibold uppercase tracking-[1px] text-black/60'>
            Stage
          </span>
          <StatusSelect inquiry={inquiry} />
        </div>
        {status === 'waitlisted' && inquiry.waitlistRank !== undefined && (
          <span className='font-sans text-xs font-semibold uppercase tracking-[1px] text-black/60'>
            Waitlist #{inquiry.waitlistRank}
          </span>
        )}
      </div>

      <div className='flex flex-col gap-2 border-2 border-black/10 p-3'>
        {pipeline === 'membership' && (
          <>
            <DateField
              id={inquiry._id}
              field='tourAt'
              value={inquiry.tourAt}
              label='Tour booked for'
            />
            <DateField
              id={inquiry._id}
              field='touredAt'
              value={inquiry.touredAt}
              label='Toured on'
            />
          </>
        )}
        <DateField
          id={inquiry._id}
          field='followUpAt'
          value={inquiry.followUpAt}
          label='Follow up on'
        />
        <DateField
          id={inquiry._id}
          field='joinedAt'
          value={inquiry.joinedAt}
          label={pipeline === 'services' ? 'Won on' : 'Joined on'}
        />
        {pipeline === 'membership' &&
          (status === 'joined' || inquiry.memberRole) && (
            <RoleSelect inquiry={inquiry} />
          )}
      </div>

      <NotesEditor id={inquiry._id} notes={inquiry.notes} />

      {inquiry.statusHistory && inquiry.statusHistory.length > 0 && (
        <div className='border-t-2 border-black/10 pt-4'>
          <h3 className='mb-2 font-sans text-xs font-semibold uppercase tracking-[1px] text-black/60'>
            History
          </h3>
          <ol className='flex flex-col'>
            {[
              { status: 'new', at: inquiry._creationTime },
              ...inquiry.statusHistory,
            ].map((entry, index, trail) => (
              <li key={index}>
                {index > 0 && (
                  <div
                    aria-hidden
                    className='ml-[3px] flex items-center gap-2.5 border-l-2 border-black/15 py-1 pl-4'
                  >
                    <span className='font-sans text-[10px] uppercase tracking-[1px] text-black/40'>
                      {stageGap(trail[index - 1].at, entry.at)}
                    </span>
                  </div>
                )}
                <div className='flex items-baseline gap-2.5'>
                  <span className='h-2 w-2 shrink-0 self-center bg-black' />
                  <span className='font-sans text-xs font-bold uppercase tracking-[1px]'>
                    {statusLabel(normalizeInquiryStatus(entry.status), pipeline)}
                  </span>
                  <span className='ml-auto font-sans text-xs text-black/50'>
                    {formatDay(entry.at)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className='border-t-2 border-black/10 pt-4'>
        <h3 className='mb-2 font-sans text-xs font-semibold uppercase tracking-[1px] text-black/60'>
          From the inquiry
        </h3>
        {inquiry.message && (
          <p className='mb-3 whitespace-pre-wrap border-l-2 border-black/20 pl-3 font-sans text-sm'>
            {inquiry.message}
          </p>
        )}
        <dl className='flex flex-col gap-1'>
        <DetailRow
          label='Email'
          value={
            <a href={`mailto:${inquiry.email}`} className='underline'>
              {inquiry.email}
            </a>
          }
        />
        {inquiry.phone && <DetailRow label='Phone' value={inquiry.phone} />}
        {inquiry.portfolio && (
          <DetailRow
            label='Portfolio'
            value={
              <a
                href={inquiry.portfolio}
                target='_blank'
                rel='noreferrer'
                className='underline'
              >
                {inquiry.portfolio}
              </a>
            }
          />
        )}
        {inquiry.socials && inquiry.socials.length > 0 && (
          <DetailRow label='Socials' value={inquiry.socials.join(', ')} />
        )}
        {inquiry.references && (
          <DetailRow label='References' value={inquiry.references} />
        )}
        {inquiry.referralSource && (
          <DetailRow label='Heard via' value={inquiry.referralSource} />
        )}
        {inquiry.mailingList && <DetailRow label='Mailing list' value='Yes' />}
        {inquiry.attribution && (
          <DetailRow label='Source' value={sourceLabel(inquiry.attribution)} />
        )}
        {inquiry.attribution?.landingPage && (
          <DetailRow label='Landed on' value={inquiry.attribution.landingPage} />
        )}
          <DetailRow
            label='Received'
            value={new Date(inquiry._creationTime).toLocaleString()}
          />
        </dl>
      </div>
    </div>
  )
}

function AddInquirySheetBody({
  onDone,
  defaultKind = 'membership',
}: {
  onDone: () => void
  defaultKind?: InquiryKind
}) {
  const addInquiry = useMutation(api.admin.addInquiry)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [kind, setKind] = useState<InquiryKind>(defaultKind)
  const [item, setItem] = useState(
    defaultKind === 'membership' ? 'Studio Membership' : ''
  )
  const [stage, setStage] = useState<InquiryStatus>('new')
  const [tour, setTour] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [notes, setNotes] = useState('')

  const pipeline = pipelineOf(kind)
  const stageOptions = PIPELINE_STATUSES[pipeline]
  const effectiveStage = stageOptions.includes(stage) ? stage : 'new'

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={async event => {
        event.preventDefault()
        setSaving(true)
        try {
          await addInquiry({
            kind,
            item,
            name,
            email,
            phone: phone.trim() || undefined,
            notes: notes.trim() || undefined,
            status: effectiveStage,
            tourAt:
              pipeline === 'membership' && tour
                ? dateInputToEpoch(tour)
                : undefined,
            followUpAt: followUp ? dateInputToEpoch(followUp) : undefined,
          })
          onDone()
        } finally {
          setSaving(false)
        }
      }}
    >
      <div>
        <SheetTitle className='font-sans text-xl font-black uppercase tracking-[-0.02em]'>
          Add inquiry
        </SheetTitle>
        <SheetDescription className='font-sans text-sm text-black/70'>
          Someone you met outside the website forms.
        </SheetDescription>
      </div>
      <Input
        value={name}
        onChange={event => setName(event.target.value)}
        placeholder='Name'
        aria-label='Name'
        required
      />
      <Input
        type='email'
        value={email}
        onChange={event => setEmail(event.target.value)}
        placeholder='Email'
        aria-label='Email'
        required
      />
      <Input
        value={phone}
        onChange={event => setPhone(event.target.value)}
        placeholder='Phone (optional)'
        aria-label='Phone'
      />
      <Input
        value={item}
        onChange={event => setItem(event.target.value)}
        placeholder='What they want, e.g. Studio Membership'
        aria-label='Item'
        required
      />
      <div className='grid grid-cols-2 gap-3'>
        <select
          value={kind}
          onChange={event => setKind(event.target.value as InquiryKind)}
          className={selectClassName}
          aria-label='Kind'
        >
          {INQUIRY_KINDS.map(k => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <select
          value={effectiveStage}
          onChange={event => setStage(event.target.value as InquiryStatus)}
          className={selectClassName}
          aria-label='Stage'
        >
          {stageOptions.map(option => (
            <option key={option} value={option}>
              {statusLabel(option, pipeline)}
            </option>
          ))}
        </select>
      </div>
      {pipeline === 'membership' && (
        <label className='flex items-center justify-between gap-2'>
          <span className='font-sans text-xs font-semibold uppercase tracking-[1px] text-black/60'>
            Tour booked for
          </span>
          <input
            type='date'
            value={tour}
            onChange={event => setTour(event.target.value)}
            className={dateInputClassName}
            aria-label='Tour date'
          />
        </label>
      )}
      <label className='flex items-center justify-between gap-2'>
        <span className='font-sans text-xs font-semibold uppercase tracking-[1px] text-black/60'>
          Follow up on
        </span>
        <input
          type='date'
          value={followUp}
          onChange={event => setFollowUp(event.target.value)}
          className={dateInputClassName}
          aria-label='Follow-up date'
        />
      </label>
      <Textarea
        value={notes}
        onChange={event => setNotes(event.target.value)}
        placeholder='Notes (optional)'
        className='min-h-[80px]'
        aria-label='Notes'
      />
      <div className='flex gap-2'>
        <Button type='submit' size='sm' disabled={saving}>
          {saving ? 'Saving…' : 'Save inquiry'}
        </Button>
        <Button type='button' variant='outline' size='sm' onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

/** The "what's next" cell: tour date, waitlist rank, or follow-up date. */
function NextCell({ inquiry }: { inquiry: Doc<'inquiries'> }) {
  const status = normalizeInquiryStatus(inquiry.status)
  const todayStart = new Date().setHours(0, 0, 0, 0)

  if (status === 'tour_booked') {
    if (inquiry.tourAt === undefined) {
      return <span className='font-bold text-red-600'>tour not scheduled</span>
    }
    if (inquiry.tourAt < todayStart) {
      return (
        <span className='font-bold text-red-600'>
          toured {formatDay(inquiry.tourAt)} · log it
        </span>
      )
    }
    if (inquiry.tourAt < todayStart + DAY) {
      return <span className='font-bold'>tour today</span>
    }
    return <span>tour {formatDay(inquiry.tourAt)}</span>
  }
  if (status === 'waitlisted') {
    return (
      <span className='font-bold'>
        #{inquiry.waitlistRank ?? '–'}
        {inquiry.followUpAt !== undefined && ` · ${formatDay(inquiry.followUpAt)}`}
      </span>
    )
  }
  if (inquiry.followUpAt === undefined) {
    return <span className='text-black/30'>—</span>
  }
  if (inquiry.followUpAt < todayStart) {
    return (
      <span className='font-bold text-red-600'>
        {formatDay(inquiry.followUpAt)} · overdue
      </span>
    )
  }
  if (inquiry.followUpAt < todayStart + DAY) {
    return <span className='font-bold'>today</span>
  }
  return <span>{formatDay(inquiry.followUpAt)}</span>
}

export function InquiriesTable({
  inquiries,
  onOpen,
  showRole,
  waitlistControls,
}: {
  inquiries: Doc<'inquiries'>[]
  onOpen: (id: Id<'inquiries'>) => void
  showRole?: boolean
  waitlistControls?: boolean
}) {
  const reorder = useMutation(api.admin.reorderWaitlist)

  return (
    // table-fixed with explicit column widths, so every instance renders
    // identical columns — content can't skew the layout, and stacked
    // tables (the dashboard's to-do sections) align with each other.
    <table className='w-full table-fixed border-collapse'>
      <thead>
        <tr className='border-b-2 border-black text-left font-sans text-xs font-semibold uppercase tracking-[1px] text-black/60'>
          {waitlistControls && (
            <th className='w-24 py-2 pr-3 font-semibold'>Order</th>
          )}
          <th className='py-2 pr-3 font-semibold'>Name</th>
          <th className='hidden w-[22%] py-2 pr-3 font-semibold md:table-cell'>
            Interest
          </th>
          <th className='w-28 py-2 pr-3 font-semibold md:w-36'>Stage</th>
          <th className='w-28 py-2 pr-3 font-semibold md:w-36'>
            {showRole ? 'Role' : 'Next'}
          </th>
          <th className='hidden w-20 py-2 pr-1 font-semibold md:table-cell'>
            Received
          </th>
          <th className='w-6 py-2' aria-label='Open' />
        </tr>
      </thead>
      <tbody>
        {inquiries.map((inquiry, index) => (
          <tr
            key={inquiry._id}
            onClick={() => onOpen(inquiry._id)}
            className='cursor-pointer border-b border-black/15 font-sans text-sm transition-colors hover:bg-black/5'
          >
            {waitlistControls && (
              <td className='py-2.5 pr-3 align-top'>
                <span
                  className='inline-flex items-center gap-1'
                  onClick={event => event.stopPropagation()}
                >
                  <span className='w-6 font-bold'>#{index + 1}</span>
                  <button
                    type='button'
                    onClick={() => reorder({ id: inquiry._id, to: 'up' })}
                    className='px-1 text-black/50 transition-colors hover:text-black'
                    aria-label='Move up'
                  >
                    ↑
                  </button>
                  <button
                    type='button'
                    onClick={() => reorder({ id: inquiry._id, to: 'down' })}
                    className='px-1 text-black/50 transition-colors hover:text-black'
                    aria-label='Move down'
                  >
                    ↓
                  </button>
                  <button
                    type='button'
                    onClick={() => reorder({ id: inquiry._id, to: 'top' })}
                    className='px-1 text-black/50 transition-colors hover:text-black'
                    aria-label='Move to top'
                  >
                    ⤒
                  </button>
                </span>
              </td>
            )}
            <td className='break-words py-2.5 pr-3 align-top'>
              <span className='font-bold'>
                {inquiry.name}
                {inquiry.notes && (
                  <span className='ml-1 text-black/40' title='Has notes'>
                    ¶
                  </span>
                )}
              </span>
              {inquiry.manual && (
                <span className='ml-2 border border-black/30 px-1 py-0.5 text-[10px] font-semibold uppercase tracking-[1px] text-black/60'>
                  manual
                </span>
              )}
              <span className='block break-all text-xs text-black/60'>
                {inquiry.email}
              </span>
            </td>
            <td className='hidden py-2.5 pr-3 align-top md:table-cell'>
              {inquiry.item}
              {inquiry.offering && ` — ${inquiry.offering}`}
              <span className='block text-xs uppercase tracking-[1px] text-black/50'>
                {inquiry.kind}
              </span>
            </td>
            <td className='py-2.5 pr-3 align-top'>
              <StatusSelect inquiry={inquiry} className='w-full' />
            </td>
            <td className='py-2.5 pr-3 align-top'>
              {showRole ? (
                inquiry.memberRole ? (
                  MEMBER_ROLE_LABELS[inquiry.memberRole]
                ) : (
                  <span className='font-bold text-red-600'>no role set</span>
                )
              ) : (
                <NextCell inquiry={inquiry} />
              )}
            </td>
            <td className='hidden py-2.5 pr-1 align-top text-black/60 md:table-cell'>
              {timeAgo(inquiry._creationTime)}
            </td>
            <td className='w-6 py-2.5 text-right align-top text-black/40'>▸</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export type InquirySheetState =
  | { type: 'add' }
  | { type: 'inquiry'; id: Id<'inquiries'> }
  | null

/** The slide-out panel hosting both the detail view and the add form. */
export function InquirySheet({
  sheet,
  onClose,
  defaultKind,
}: {
  sheet: InquirySheetState
  onClose: () => void
  defaultKind?: InquiryKind
}) {
  return (
    <Sheet open={sheet !== null} onOpenChange={open => !open && onClose()}>
      <SheetContent
        side='right'
        className='w-full overflow-y-auto border-l-2 border-black sm:max-w-md'
      >
        {sheet?.type === 'add' && (
          <AddInquirySheetBody onDone={onClose} defaultKind={defaultKind} />
        )}
        {sheet?.type === 'inquiry' && <InquirySheetBody id={sheet.id} />}
      </SheetContent>
    </Sheet>
  )
}

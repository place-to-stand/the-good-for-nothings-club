'use client'

import { Authenticated, useMutation, usePaginatedQuery } from 'convex/react'
import { useState } from 'react'

import LoadMore from '@/components/admin/LoadMore'
import { selectClassName } from '@/components/ui/fieldStyles'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { INQUIRY_STATUSES, type InquiryStatus } from '@/data/schemas'
import { cn } from '@/lib/utils'

const kinds = ['facility', 'service', 'membership', 'event', 'general'] as const
type Kind = (typeof kinds)[number]
const PAGE_SIZE = 20

/** Rows predating the status field are 'new'. */
function StatusSelect({
  id,
  status,
}: {
  id: Id<'inquiries'>
  status?: InquiryStatus
}) {
  const setStatus = useMutation(api.admin.setInquiryStatus)

  return (
    <select
      value={status ?? 'new'}
      onChange={event =>
        setStatus({ id, status: event.target.value as InquiryStatus })
      }
      className={cn(selectClassName, 'h-8 w-auto px-2 text-xs uppercase')}
      aria-label='Inquiry status'
    >
      {INQUIRY_STATUSES.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
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

function Inquiries() {
  const [kind, setKind] = useState<Kind | ''>('')
  const {
    results: inquiries,
    status,
    loadMore,
  } = usePaginatedQuery(api.admin.listInquiries, kind ? { kind } : {}, {
    initialNumItems: PAGE_SIZE,
  })

  return (
    <div>
      <div className='mb-6 max-w-xs'>
        <select
          value={kind}
          onChange={event => setKind(event.target.value as Kind | '')}
          className={selectClassName}
          aria-label='Filter by kind'
        >
          <option value=''>All kinds</option>
          {kinds.map(k => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
      {status === 'LoadingFirstPage' ? (
        <p className='font-sans text-sm text-black/60'>Loading…</p>
      ) : inquiries.length === 0 ? (
        <p className='font-sans text-sm text-black/60'>No inquiries yet.</p>
      ) : (
        <ul className='flex flex-col gap-4'>
          {inquiries.map(inquiry => (
            <li key={inquiry._id} className='border-2 border-black p-4'>
              <div className='flex flex-wrap items-baseline justify-between gap-2'>
                <span className='font-sans font-bold'>
                  {inquiry.name}{' '}
                  <a href={`mailto:${inquiry.email}`} className='font-normal underline'>
                    {inquiry.email}
                  </a>
                </span>
                <span className='font-sans text-xs uppercase tracking-[1px] text-black/60'>
                  {inquiry.kind} · {new Date(inquiry._creationTime).toLocaleString()}
                </span>
              </div>
              <div className='mt-2 flex flex-wrap items-center justify-between gap-2 font-sans text-sm'>
                <div>
                  <span className='font-semibold'>{inquiry.item}</span>
                  {inquiry.offering && <span> — {inquiry.offering}</span>}
                </div>
                <StatusSelect id={inquiry._id} status={inquiry.status} />
              </div>
              <dl className='mt-2 grid gap-x-8 gap-y-1 font-sans text-sm text-black/80 md:grid-cols-2'>
                {inquiry.phone && <Row label='Phone' value={inquiry.phone} />}
                {inquiry.portfolio && <Row label='Portfolio' value={inquiry.portfolio} />}
                {inquiry.socials && inquiry.socials.length > 0 && (
                  <Row label='Socials' value={inquiry.socials.join(', ')} />
                )}
                {inquiry.references && <Row label='References' value={inquiry.references} />}
                {inquiry.attribution && (
                  <Row label='Source' value={sourceLabel(inquiry.attribution)} />
                )}
                {inquiry.attribution?.landingPage && (
                  <Row label='Landed on' value={inquiry.attribution.landingPage} />
                )}
              </dl>
              {inquiry.message && (
                <p className='mt-2 whitespace-pre-wrap border-l-2 border-black/20 pl-3 font-sans text-sm'>
                  {inquiry.message}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      <LoadMore status={status} onClick={() => loadMore(PAGE_SIZE)} />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex gap-2'>
      <dt className='font-semibold'>{label}:</dt>
      <dd className='break-all'>{value}</dd>
    </div>
  )
}

export default function AdminInquiriesPage() {
  return (
    <Authenticated>
      <Inquiries />
    </Authenticated>
  )
}

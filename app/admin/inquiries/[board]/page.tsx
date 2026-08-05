'use client'

import { Authenticated, usePaginatedQuery, useQuery } from 'convex/react'
import { notFound, useParams } from 'next/navigation'
import { useState } from 'react'

import LoadMore from '@/components/admin/LoadMore'
import {
  InquiriesTable,
  InquirySheet,
  statusLabel,
  type InquirySheetState,
} from '@/components/admin/inquiries'
import { Button } from '@/components/ui/Button'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import {
  MEMBER_ROLES,
  MEMBER_ROLE_LABELS,
  PIPELINES,
  PIPELINE_STATUSES,
  type InquiryKind,
  type InquiryStatus,
  type MemberRole,
  type Pipeline,
} from '@/data/schemas'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 50

const BOARD_LABELS: Record<Pipeline, string> = {
  membership: 'Membership',
  services: 'Services',
  inbox: 'Inbox',
}

/** What kind a hand-added inquiry defaults to, per board. */
const BOARD_DEFAULT_KIND: Record<Pipeline, InquiryKind> = {
  membership: 'membership',
  services: 'service',
  inbox: 'general',
}

/**
 * One tile per stage — mutually exclusive and covering the whole ladder,
 * so the tile counts always sum to the board's total and no stage is
 * hidden inside a rollup. "Everything" is the unselected state: clicking
 * the selected tile again clears the filter.
 */
// One grid for every board (sized to membership's 9 stages), so tiles stay
// the same physical size when hopping between boards — shorter ladders
// just leave trailing space.
const TILE_GRID = 'grid-cols-3 md:grid-cols-5 lg:grid-cols-9'

function Board({ board }: { board: Pipeline }) {
  // Lands on 'new' (the triage view); deselecting the tile shows everything.
  const [stageTile, setStageTile] = useState<InquiryStatus | null>('new')
  const [roleFilter, setRoleFilter] = useState<MemberRole | ''>('')
  const [sheet, setSheet] = useState<InquirySheetState>(null)

  const summary = useQuery(api.admin.pipelineSummary, {})
  const stages = PIPELINE_STATUSES[board]
  const isWaitlistView = board === 'membership' && stageTile === 'waitlisted'
  const isJoinedView = board === 'membership' && stageTile === 'joined'

  const waitlist = useQuery(api.admin.listWaitlist, isWaitlistView ? {} : 'skip')
  const paginated = usePaginatedQuery(
    api.admin.listInquiries,
    isWaitlistView
      ? 'skip'
      : {
          pipeline: board,
          ...(stageTile ? { statuses: [stageTile] } : {}),
        },
    { initialNumItems: PAGE_SIZE }
  )

  const openSheet = (id: Id<'inquiries'>) => setSheet({ type: 'inquiry', id })

  const boardRows = isWaitlistView
    ? waitlist
    : paginated.status === 'LoadingFirstPage'
      ? undefined
      : paginated.results

  const visibleRows =
    isJoinedView && roleFilter && boardRows
      ? boardRows.filter(inquiry => inquiry.memberRole === roleFilter)
      : boardRows

  return (
    <div>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h1 className='font-sans text-2xl leading-none font-black tracking-[-0.02em] uppercase'>
          {BOARD_LABELS[board]}
        </h1>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setSheet({ type: 'add' })}
        >
          + Add inquiry
        </Button>
      </div>

      <div className={cn('mt-4 grid gap-2', TILE_GRID)}>
        {stages.map(status => {
          const active = stageTile === status
          const count = summary
            ? (summary.boards[board][status] ?? 0)
            : undefined
          return (
            <button
              key={status}
              type='button'
              onClick={() => {
                setStageTile(active ? null : status)
                setRoleFilter('')
              }}
              className={cn(
                'border-2 border-black p-2.5 text-left transition-colors',
                active ? 'bg-black text-white' : 'hover:bg-black/5',
                count === 0 && !active && 'opacity-40'
              )}
              aria-pressed={active}
            >
              <div className='font-sans text-xl leading-none font-bold'>
                {count ?? '–'}
              </div>
              <div
                className={cn(
                  'mt-1 font-sans text-[10px] leading-tight uppercase tracking-[1px]',
                  active ? 'text-white/70' : 'text-black/60'
                )}
              >
                {statusLabel(status, board)}
              </div>
            </button>
          )
        })}
      </div>

      {isJoinedView && (
        <div className='mt-4 flex gap-2'>
          {(['', ...MEMBER_ROLES] as const).map(role => (
            <button
              key={role || 'all'}
              type='button'
              onClick={() => setRoleFilter(role)}
              className={cn(
                'border-2 border-black px-3 py-1 font-sans text-xs font-medium uppercase transition-colors',
                roleFilter === role ? 'bg-black text-white' : 'hover:bg-black/10'
              )}
            >
              {role ? MEMBER_ROLE_LABELS[role] : 'All'}
            </button>
          ))}
        </div>
      )}

      <div className='mt-5'>
        {visibleRows === undefined ? (
          <p className='font-sans text-sm text-black/60'>Loading…</p>
        ) : visibleRows.length === 0 ? (
          <p className='border-2 border-black/10 p-6 text-center font-sans text-sm text-black/60'>
            {isWaitlistView ? 'Waitlist is empty.' : 'Nothing here.'}
          </p>
        ) : (
          <>
            <InquiriesTable
              inquiries={visibleRows}
              onOpen={openSheet}
              showRole={isJoinedView}
              waitlistControls={isWaitlistView}
            />
            {!isWaitlistView && (
              <LoadMore
                status={paginated.status}
                onClick={() => paginated.loadMore(PAGE_SIZE)}
              />
            )}
          </>
        )}
      </div>

      <InquirySheet
        sheet={sheet}
        onClose={() => setSheet(null)}
        defaultKind={BOARD_DEFAULT_KIND[board]}
      />
    </div>
  )
}

export default function AdminBoardPage() {
  const params = useParams<{ board: string }>()
  if (!(PIPELINES as readonly string[]).includes(params.board)) {
    notFound()
  }
  const board = params.board as Pipeline
  // Keyed so tile/filter state resets when hopping between boards.
  return (
    <Authenticated>
      <Board key={board} board={board} />
    </Authenticated>
  )
}

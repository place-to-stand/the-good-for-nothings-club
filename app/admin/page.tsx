'use client'

import { Authenticated, useQuery } from 'convex/react'
import { useState } from 'react'

import {
  InquiriesTable,
  InquirySheet,
  type InquirySheetState,
} from '@/components/admin/inquiries'
import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'

function TodoSection({
  title,
  inquiries,
  onOpen,
}: {
  title: string
  inquiries: Doc<'inquiries'>[]
  onOpen: (id: Id<'inquiries'>) => void
}) {
  if (inquiries.length === 0) return null
  return (
    <div>
      <h2 className='mb-1 font-sans text-xs font-semibold uppercase tracking-[1px] text-black/60'>
        {title} ({inquiries.length})
      </h2>
      <InquiriesTable inquiries={inquiries} onOpen={onOpen} />
    </div>
  )
}

function Dashboard() {
  // Stable per mount so the reactive query args don't churn every render.
  const [now] = useState(() => Date.now())
  const todayEnd = new Date(now).setHours(23, 59, 59, 999)

  const [sheet, setSheet] = useState<InquirySheetState>(null)
  const todo = useQuery(api.admin.listTodo, { dueBefore: todayEnd })

  const todoCount =
    todo === undefined
      ? undefined
      : todo.tours.length + todo.followUps.length + todo.fresh.length

  const openSheet = (id: Id<'inquiries'>) => setSheet({ type: 'inquiry', id })

  return (
    <div>
      <h1 className='font-sans text-2xl leading-none font-black tracking-[-0.02em] uppercase'>
        To-do
      </h1>

      <div className='mt-5'>
        {todo === undefined ? (
          <p className='font-sans text-sm text-black/60'>Loading…</p>
        ) : todoCount === 0 ? (
          <p className='border-2 border-black/10 p-6 text-center font-sans text-sm text-black/60'>
            All caught up — no tours to log, nothing due, no new inquiries.
          </p>
        ) : (
          <div className='flex flex-col gap-6'>
            <TodoSection
              title='Tours to run or log'
              inquiries={todo.tours}
              onOpen={openSheet}
            />
            <TodoSection
              title='Follow-ups due'
              inquiries={todo.followUps}
              onOpen={openSheet}
            />
            <TodoSection
              title='New inquiries'
              inquiries={todo.fresh}
              onOpen={openSheet}
            />
          </div>
        )}
      </div>

      <InquirySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <Authenticated>
      <Dashboard />
    </Authenticated>
  )
}

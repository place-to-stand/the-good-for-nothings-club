'use client'

import { Authenticated } from 'convex/react'
import { useQuery } from 'convex/react'
import Link from 'next/link'

import { api } from '@/convex/_generated/api'

function Dashboard() {
  const counts = useQuery(api.admin.counts)

  const cards = [
    { label: 'Inquiries', value: counts?.inquiries, href: '/admin/inquiries' },
    { label: 'Projects', value: counts?.projects, href: '/admin/projects' },
    { label: 'Members', value: counts?.members, href: '/admin/members' },
    { label: 'Media', value: counts?.media, href: '/admin/media' },
  ]

  return (
    <div>
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        {cards.map(card => (
          <Link
            key={card.label}
            href={card.href}
            className='border-2 border-black p-6 transition-colors hover:bg-black hover:text-white'
          >
            <div className='font-sans text-4xl font-bold'>{card.value ?? '–'}</div>
            <div className='mt-1 font-sans text-sm uppercase tracking-[1px]'>{card.label}</div>
          </Link>
        ))}
      </div>
      {counts && (
        <p className='mt-6 font-sans text-sm text-black/60'>
          Media storage: {(counts.mediaBytes / 1e6).toFixed(1)} MB
        </p>
      )}
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

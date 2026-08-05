'use client'

import { Authenticated, useQuery } from 'convex/react'
import Image from 'next/image'

import { api } from '@/convex/_generated/api'

function Members() {
  const members = useQuery(api.admin.listMembers)

  if (members === undefined) {
    return <p className='font-sans text-sm text-black/60'>Loading…</p>
  }

  return (
    <ul className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {members.map(member => (
        <li key={member._id} className='flex gap-4 border-2 border-black p-4'>
          <Image
            src={member.profilePicture.url}
            alt={member.profilePicture.caption ?? member.fullName}
            width={160}
            height={160}
            className='h-20 w-20 shrink-0 border border-black/20 object-cover'
          />
          <div className='font-sans text-sm'>
            <div className='font-bold'>
              #{member.memberNumber} {member.fullName}
            </div>
            <div className='text-black/60'>{member.roles.join(', ')}</div>
            <div className='mt-1 text-xs text-black/60'>Joined {member.startDate}</div>
            <a
              href={`/members/${member.slug}`}
              className='text-xs text-black/60 underline'
              target='_blank'
            >
              /members/{member.slug}
            </a>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function AdminMembersPage() {
  return (
    <Authenticated>
      <Members />
    </Authenticated>
  )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '../data/client'
import { GFNC_member } from '../types'
import { useState } from 'react'

type MemberProfilePictureProps = {
  member: GFNC_member
}

export default function MemberProfilePicture({
  member,
}: MemberProfilePictureProps) {
  const [isHovering, setIsHovering] = useState(false)

  const { profilePicture, hoverProfilePicture } = member

  const profilePictureUrl = getImageUrl(profilePicture)
    .width(1400)
    .quality(90)
    .url()

  const hoverProfilePictureUrl = getImageUrl(hoverProfilePicture)
    .width(1400)
    .quality(90)
    .url()

  const objectPosition = `${(profilePicture.hotspot?.x || 1) * 100}% ${(profilePicture.hotspot?.y || 1) * 100}%`

  return (
    <li
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className='group relative'
    >
      <Image
        src={profilePictureUrl}
        width={profilePicture.asset.metadata.dimensions.width}
        height={profilePicture.asset.metadata.dimensions.height}
        alt={profilePicture.caption}
        className={`aspect-square border-1 border-black object-cover transition-colors group-hover:border-gray-600 md:h-auto lg:aspect-auto ${isHovering ? 'hidden' : 'block'}`}
        style={{
          objectPosition,
        }}
        priority={true}
        unoptimized
        placeholder={profilePicture.asset.metadata.lqip}
      />
      <Image
        src={hoverProfilePictureUrl}
        width={hoverProfilePicture.asset.metadata.dimensions.width}
        height={hoverProfilePicture.asset.metadata.dimensions.height}
        alt={hoverProfilePicture.caption}
        className={`aspect-square border-1 border-black object-cover transition-colors group-hover:border-gray-600 md:h-auto lg:aspect-auto ${isHovering ? 'block' : 'hidden'}`}
        style={{
          objectPosition,
        }}
        priority={true}
        placeholder={hoverProfilePicture.asset.metadata.lqip}
        unoptimized
      />
      <h3 className='relative z-10 mt-3 text-[15px] leading-tight font-extrabold tracking-[-0.01em] group-hover:underline'>
        <Link href={`/members/${member.slug.current}`}>{member.fullName}</Link>
      </h3>
      <p className='mt-1 text-[11px] leading-tight font-semibold tracking-[0.08em] text-black/60 uppercase'>
        #{String(member.memberNumber).padStart(3, '0')} · Since{' '}
        {new Date(member.startDate).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
        })}
      </p>
      <p className='mt-1 text-xs leading-tight text-black/70'>
        {member.roles.join(', ').toLowerCase()}
      </p>
      <Link
        href={`/members/${member.slug.current}`}
        className='absolute inset-0'
      />
    </li>
  )
}

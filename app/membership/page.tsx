import type { Metadata, ResolvingMetadata } from 'next'

import GroupLabel from '@/components/GroupLabel'
import InquiryForm from '@/components/InquiryForm'
import OfferCard from '@/components/OfferCard'
import PageShell from '@/components/PageShell'
import SectionHeading from '@/components/SectionHeading'
import { membershipCopy, membershipTiers } from '@/data/membership'

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const pathname = '/membership'

  return {
    title: 'Membership',
    description:
      'Join the club, at your level — member, associate, or friend. Apply anytime to join the waitlist; onboarding happens in waves as space opens up.',
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      ...openGraph,
      url: pathname,
    },
  }
}

export default function Membership() {
  return (
    <PageShell
      title='Membership'
      lead={`Join the club, gain a community. ${membershipCopy.lead}`}
    >
      {/* Tiers */}
      <SectionHeading
        title={membershipCopy.tiersTitle}
        lead={membershipCopy.tiersLead}
      />
      <div className='mt-6 grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3 lg:gap-y-0'>
        {membershipTiers.map(tier => (
          <OfferCard
            key={tier.slug}
            id={tier.slug}
            className='lg:grid lg:row-span-3 lg:grid-rows-subgrid'
            title={tier.name}
            price={tier.price}
            description={tier.tagline}
          >
            {tier.includes && <GroupLabel>{tier.includes}</GroupLabel>}
            <ul className='mt-2 list-disc space-y-1 pl-5 font-sans text-sm'>
              {tier.perks.map(perk => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
          </OfferCard>
        ))}
      </div>

      {/* How to join + apply */}
      <SectionHeading title={membershipCopy.joiningTitle} />
      <div
        id='apply'
        className='mt-6 grid scroll-mt-28 grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12'
      >
        <div>
          <ol className='space-y-4'>
            {membershipCopy.joining.map((step, i) => (
              <li key={step.label} className='flex gap-4 font-sans'>
                <span className='flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black font-black'>
                  {i + 1}
                </span>
                <div className='leading-snug'>
                  <span className='font-black uppercase'>{step.label}: </span>
                  {step.text}
                </div>
              </li>
            ))}
          </ol>
          <div className='mt-6 space-y-4 font-sans text-sm'>
            {membershipCopy.policies.map(policy => (
              <div key={policy.label} className='bg-black/5 p-5'>
                <h3 className='font-black tracking-wide uppercase'>
                  {policy.label}
                </h3>
                <ul className='mt-2 list-disc space-y-1 pl-5'>
                  {policy.points.map(point => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <OfferCard title='Apply'>
          <InquiryForm
            kind='membership'
            item={membershipTiers[0].name}
            itemOptions={membershipTiers.map(tier => tier.name)}
            itemLabel='Membership level'
            submitLabel='Apply'
          />
        </OfferCard>
      </div>

      {/* More than a room */}
      <SectionHeading title={membershipCopy.moreTitle} />
      <div className='mt-6 grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3'>
        {membershipCopy.moreCards.map(card => (
          <OfferCard
            key={card.title}
            title={card.title}
            description={card.body}
          />
        ))}
      </div>

      {/* How members earn */}
      <SectionHeading
        title={membershipCopy.earningTitle}
        lead={membershipCopy.earningIntro}
      />
      <dl className='mt-6 divide-y divide-black/20 font-sans text-sm'>
        {membershipCopy.splits.map(split => (
          <div
            key={split.label}
            className='flex flex-col justify-between gap-1 py-3 sm:flex-row sm:items-center sm:gap-4'
          >
            <dt className='text-xs font-extrabold tracking-[0.08em] uppercase'>
              {split.label}
            </dt>
            <dd>{split.value}</dd>
          </div>
        ))}
      </dl>
    </PageShell>
  )
}

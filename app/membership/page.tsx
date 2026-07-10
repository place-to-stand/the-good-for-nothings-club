import type { Metadata, ResolvingMetadata } from 'next'

import GroupLabel from '@/components/GroupLabel'
import MembershipApplicationForm from '@/components/MembershipApplicationForm'
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
      'Join the club, at your level - member, associate, or friend. Apply anytime to join the waitlist; onboarding happens in waves as space opens up.',
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
            className='lg:row-span-3 lg:grid lg:grid-rows-subgrid'
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
          <ol className='mt-6 space-y-10'>
            {membershipCopy.joining.map((step, i) => (
              <li key={step.label} className='font-sans'>
                <div className='flex items-center gap-4'>
                  <span className='text-background flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-black font-black'>
                    {i + 1}
                  </span>
                  <h3 className='text-2xl font-extrabold tracking-wide uppercase'>
                    {step.label}
                  </h3>
                </div>
                <ul className='mt-3 ml-12 list-disc space-y-1 pl-5 text-base leading-snug'>
                  {step.points.map(point => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <div className='mx-12 mt-20 space-y-7 bg-black/5 px-5 py-7 font-sans text-xs'>
            {membershipCopy.policies.map(policy => (
              <div key={policy.label} className=''>
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
        <OfferCard title='Application'>
          <MembershipApplicationForm />
        </OfferCard>
      </div>
    </PageShell>
  )
}

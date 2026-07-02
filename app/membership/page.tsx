import type { Metadata, ResolvingMetadata } from 'next'

import InquiryForm from '@/components/InquiryForm'
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
    <main>
      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
          <h1 className='pt-6 text-center text-[32px] leading-none font-black tracking-[-0.04em] md:pt-8 md:text-[48px] lg:text-[96px]'>
            Membership
          </h1>

          <div className='mt-10 border-t-2 border-black pt-12 sm:mt-12 md:mt-20'>
            <p className='mx-auto max-w-3xl text-center font-serif text-2xl leading-tight sm:text-[28px]'>
              Join the club, at your level. {membershipCopy.lead}
            </p>

            {/* Tiers */}
            <div className='mt-12 grid grid-cols-1 gap-6 md:mt-16 md:gap-8 lg:grid-cols-3'>
              {membershipTiers.map(tier => (
                <article
                  key={tier.slug}
                  id={tier.slug}
                  className='flex scroll-mt-28 flex-col border-2 border-black p-6 md:p-8'
                >
                  <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1'>
                    <h2 className='text-[28px] leading-none font-black tracking-[-0.03em] md:text-[32px]'>
                      {tier.name}
                    </h2>
                    {tier.price && (
                      <span className='font-sans text-sm font-black tracking-tight uppercase'>
                        {tier.price}
                      </span>
                    )}
                  </div>
                  <p className='mt-3 font-serif text-xl leading-snug'>
                    {tier.tagline}
                  </p>
                  {tier.includes && (
                    <p className='mt-4 font-sans text-xs font-semibold tracking-wide uppercase'>
                      {tier.includes}
                    </p>
                  )}
                  <ul className='mt-2 list-disc space-y-1 pl-5 font-sans text-sm'>
                    {tier.perks.map(perk => (
                      <li key={perk}>{perk}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            {/* How to join + apply, side by side */}
            <div
              id='apply'
              className='mt-14 grid scroll-mt-28 grid-cols-1 gap-8 md:mt-20 lg:grid-cols-2 lg:gap-12'
            >
              <div>
                <h2 className='text-[28px] font-black tracking-[-0.03em] md:text-[40px]'>
                  {membershipCopy.joiningTitle}
                </h2>
                <ol className='mt-6 space-y-4'>
                  {membershipCopy.joining.map((step, i) => (
                    <li key={step.label} className='flex gap-4 font-sans'>
                      <span className='flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black font-black'>
                        {i + 1}
                      </span>
                      <div className='leading-snug'>
                        <span className='font-black uppercase'>
                          {step.label}:{' '}
                        </span>
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
              <div className='border-2 border-black p-6 md:p-10'>
                <h2 className='text-[28px] font-black tracking-[-0.03em] md:text-[40px]'>
                  Apply
                </h2>
                <div className='mt-6'>
                  <InquiryForm
                    kind='membership'
                    item={membershipTiers[0].name}
                    itemOptions={membershipTiers.map(tier => tier.name)}
                    itemLabel='Membership level'
                    submitLabel='Apply'
                  />
                </div>
              </div>
            </div>

            {/* More than a room */}
            <h2 className='mt-14 text-[28px] font-black tracking-[-0.03em] md:mt-20 md:text-[40px]'>
              {membershipCopy.moreTitle}
            </h2>
            <div className='mt-6 grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3'>
              {membershipCopy.moreCards.map(card => (
                <div key={card.title} className='border-2 border-black p-6'>
                  <h3 className='text-[20px] leading-tight font-black tracking-[-0.02em]'>
                    {card.title}
                  </h3>
                  <p className='mt-3 font-sans text-sm leading-snug'>
                    {card.body}
                  </p>
                </div>
              ))}
            </div>

            {/* How members earn */}
            <h2 className='mt-14 text-[28px] font-black tracking-[-0.03em] md:mt-20 md:text-[40px]'>
              {membershipCopy.earningTitle}
            </h2>
            <p className='mt-3 max-w-3xl font-sans leading-snug'>
              {membershipCopy.earningIntro}
            </p>
            <dl className='mt-6 divide-y-2 divide-black border-2 border-black font-sans text-sm'>
              {membershipCopy.splits.map(split => (
                <div
                  key={split.label}
                  className='flex flex-col justify-between gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4'
                >
                  <dt className='font-black uppercase'>{split.label}</dt>
                  <dd>{split.value}</dd>
                </div>
              ))}
            </dl>

          </div>
        </div>
      </section>
    </main>
  )
}

import { Fragment } from 'react'

type FeatureBandProps = {
  /** Small-caps kicker, e.g. "Included with every rental". */
  label: string
  items: string[]
}

/**
 * A tinted band calling out a list of selling points (amenities, perks) —
 * visible without shouting.
 */
export default function FeatureBand({ label, items }: FeatureBandProps) {
  return (
    <section className='bg-black/5 px-6 py-7 md:px-10 md:py-8'>
      <h2 className='font-sans text-xs font-black tracking-[0.08em] text-black/60 uppercase'>
        {label}
      </h2>
      <p className='mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-2 font-sans text-lg leading-none font-bold md:text-xl'>
        {items.map((item, index) => (
          <Fragment key={item}>
            {index > 0 && (
              <span aria-hidden className='text-black/30'>
                ·
              </span>
            )}
            <span>{item}</span>
          </Fragment>
        ))}
      </p>
    </section>
  )
}

import { Fragment } from 'react'

type FeatureBandProps = {
  /** Small-caps kicker, e.g. "Included with every rental". */
  label: string
  items: string[]
}

/**
 * An inverted statement band: black block, display-type item list.
 * For the selling points that shouldn't whisper (amenities, perks).
 */
export default function FeatureBand({ label, items }: FeatureBandProps) {
  return (
    <section className='bg-black px-6 py-8 md:px-10 md:py-10'>
      <h2 className='font-sans text-xs font-black tracking-[0.08em] text-white/60 uppercase'>
        {label}
      </h2>
      <p className='mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-3 font-sans text-[22px] leading-none font-black tracking-[-0.02em] text-white uppercase md:gap-x-4 md:text-[28px]'>
        {items.map((item, index) => (
          <Fragment key={item}>
            {index > 0 && (
              <span aria-hidden className='text-white/40'>
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

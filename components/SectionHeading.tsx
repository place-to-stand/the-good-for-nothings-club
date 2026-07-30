import { cn } from '@/lib/utils'

type SectionHeadingProps = {
  title: string
  lead?: string
  /** Override the default top margin, e.g. 'mt-2' at the top of a card. */
  className?: string
}

/** Section title within a PageShell, with an optional one-line lead. */
export default function SectionHeading({
  title,
  lead,
  className,
}: SectionHeadingProps) {
  return (
    <>
      <h2
        className={cn(
          'mt-14 text-[28px] font-black tracking-[-0.03em] md:mt-20 md:text-[40px]',
          className
        )}
      >
        {title}
      </h2>
      {lead && (
        <p className='mt-2 max-w-3xl font-sans leading-snug text-balance'>
          {lead}
        </p>
      )}
    </>
  )
}

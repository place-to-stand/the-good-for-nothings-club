type SectionHeadingProps = {
  title: string
  lead?: string
}

/** Section title within a PageShell, with an optional one-line lead. */
export default function SectionHeading({ title, lead }: SectionHeadingProps) {
  return (
    <>
      <h2 className='mt-14 text-[28px] font-black tracking-[-0.03em] md:mt-20 md:text-[40px]'>
        {title}
      </h2>
      {lead && <p className='mt-3 max-w-3xl font-sans leading-snug'>{lead}</p>}
    </>
  )
}

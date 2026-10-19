import type { ReactNode } from 'react'

type PageShellProps = {
  title: string
  /** Serif intro under the title - the one serif use per page. */
  lead?: ReactNode
  children: ReactNode
  /** Sections rendered after the main card, e.g. a PageShellSection. */
  after?: ReactNode
}

/**
 * A bordered card section matching the main PageShell card - use inside
 * `after` to split content into its own card, homepage-style.
 */
export function PageShellSection({ children }: { children: ReactNode }) {
  return (
    <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
      <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
        {children}
      </div>
    </section>
  )
}

/**
 * The standard page frame: bordered section, a compact header with the
 * title on the left and the serif lead on the right, then a divider.
 * Content renders below the divider.
 */
export default function PageShell({
  title,
  lead,
  children,
  after,
}: PageShellProps) {
  return (
    <main>
      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 pt-5 pb-6 md:border-x-2 md:px-12 md:pt-8 md:pb-12'>
          <header className='flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-12'>
            <h1 className='text-[32px] leading-[0.9] font-black tracking-[-0.04em] md:text-[48px] lg:text-[64px]'>
              {title}
            </h1>
            {lead && (
              <p className='max-w-xl font-serif text-lg leading-tight text-balance sm:text-xl md:pb-1 md:text-right'>
                {lead}
              </p>
            )}
          </header>
          <div className='mt-5 border-t-2 border-black pt-2 md:mt-8'>
            {children}
          </div>
        </div>
      </section>
      {after}
    </main>
  )
}

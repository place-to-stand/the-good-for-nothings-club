import type { ReactNode } from 'react'

type PageShellProps = {
  title: string
  /** Serif intro under the title - the one serif use per page. */
  lead?: ReactNode
  children: ReactNode
  /** Sections rendered after the main card, e.g. a PageShellSection. */
  after?: ReactNode
}

/** The two-column grid every page body uses, so columns match page to page. */
export const pageColumns = 'grid grid-cols-1 lg:grid-cols-2 lg:gap-x-16'

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
 * Title and lead are trimmed to cap height and baseline, so the space
 * above and below them is equal and the title sits centred.
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
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 pt-7 pb-6 md:border-x-2 md:px-12 md:pt-8 md:pb-12'>
          <header className='flex flex-col gap-5 md:min-h-16 md:flex-row md:items-center md:justify-between md:gap-12'>
            <h1 className='text-[44px] leading-[0.9] font-black tracking-[-0.04em] [text-box:trim-both_cap_alphabetic] md:text-[48px] lg:text-[64px]'>
              {title}
            </h1>
            {lead && (
              <p className='max-w-xl font-serif text-xl leading-snug text-pretty [text-box:trim-both_cap_alphabetic] md:text-right md:leading-tight md:text-balance lg:max-w-3xl'>
                {lead}
              </p>
            )}
          </header>
          <div className='mt-7 border-t-2 border-black pt-2 md:mt-8'>
            {children}
          </div>
        </div>
      </section>
      {after}
    </main>
  )
}

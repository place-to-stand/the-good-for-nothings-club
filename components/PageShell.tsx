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
 * The standard page frame: bordered section, display title, divider,
 * optional serif lead. Content renders below the divider.
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
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
          <h1 className='pt-6 text-center text-[32px] leading-none font-black tracking-[-0.04em] md:pt-8 md:text-[48px] lg:text-[80px]'>
            {title}
          </h1>
          {lead && (
            <p className='mx-auto mt-1 max-w-3xl text-center font-serif text-xl leading-tight text-balance sm:text-2xl'>
              {lead}
            </p>
          )}
          <div className='mt-10 border-t-2 border-black pt-2 sm:mt-12 md:mt-20'>
            {children}
          </div>
        </div>
      </section>
      {after}
    </main>
  )
}

import type { ReactNode } from 'react'

type PageShellProps = {
  title: string
  /** Serif intro under the title — the one serif use per page. */
  lead?: ReactNode
  children: ReactNode
}

/**
 * The standard page frame: bordered section, display title, divider,
 * optional serif lead. Content renders below the divider.
 */
export default function PageShell({ title, lead, children }: PageShellProps) {
  return (
    <main>
      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
          <h1 className='pt-6 text-center text-[32px] leading-none font-black tracking-[-0.04em] md:pt-8 md:text-[48px] lg:text-[96px]'>
            {title}
          </h1>
          {lead && (
            <p className='mx-auto max-w-3xl text-center font-serif text-2xl leading-tight sm:text-[28px]'>
              {lead}
            </p>
          )}
          <div className='mt-10 border-t-2 border-black pt-2 sm:mt-12 md:mt-20'>
            {children}
          </div>
        </div>
      </section>
    </main>
  )
}

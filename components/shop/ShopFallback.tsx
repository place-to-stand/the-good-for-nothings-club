/**
 * App Shell placeholder for shop pages: the empty page card, spaced like
 * PageShell so nothing jumps when the content arrives.
 */
export default function ShopFallback() {
  return (
    <main>
      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto min-h-[70vh] max-w-(--page-max-width) border-y-2 border-black md:border-x-2' />
      </section>
    </main>
  )
}

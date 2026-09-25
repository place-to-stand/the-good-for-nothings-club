import Link from 'next/link'

import { Button } from '@/components/ui/Button'

/**
 * Catches notFound() from admin pages (e.g. an unknown inquiry board) so it
 * renders inside the admin shell instead of the marketing 404.
 */
export default function AdminNotFound() {
  return (
    <div className='mx-auto flex min-h-full max-w-sm flex-col justify-center py-8 text-center'>
      <h2 className='mb-2 text-[28px] font-black tracking-[-0.03em]'>
        Not found
      </h2>
      <p className='mb-6 font-sans text-sm text-black/70'>
        That admin page doesn&apos;t exist.
      </p>
      <Button asChild className='hover:no-underline'>
        <Link href='/admin'>Back to dashboard</Link>
      </Button>
    </div>
  )
}

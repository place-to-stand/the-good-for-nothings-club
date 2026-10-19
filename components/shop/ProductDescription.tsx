import { cn } from '@/lib/utils'

/**
 * A product description as written in Shopify's product editor: keeps its
 * paragraphs, lists and bold, in the site's type.
 */
export default function ProductDescription({
  html,
  className,
}: {
  html: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'prose prose-headings:font-sans prose-headings:text-black prose-p:text-black prose-li:text-black prose-strong:text-black prose-table:text-sm prose-td:text-black prose-th:text-black prose-li:my-1 prose-ul:pl-5 prose-a:text-black prose-a:underline-offset-2 prose-thead:border-b-2 max-w-none font-sans text-black [--tw-prose-bullets:black] [--tw-prose-counters:black] [--tw-prose-td-borders:black] [--tw-prose-th-borders:black] [&_a]:bg-none',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

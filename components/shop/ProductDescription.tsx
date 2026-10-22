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
        'prose prose-headings:font-sans prose-headings:text-black prose-p:text-black prose-li:text-black prose-strong:text-black prose-table:text-sm prose-td:text-black prose-th:text-black prose-li:my-1 prose-ul:pl-5 prose-a:font-bold prose-a:text-black prose-a:no-underline prose-thead:border-b-2 prose-th:py-3 prose-td:py-3 prose-th:align-bottom max-w-none font-sans text-black [--tw-prose-bullets:black] [--tw-prose-counters:black] [--tw-prose-td-borders:black] [--tw-prose-th-borders:black] [&_td>br:last-child]:hidden [&_td>p]:m-0 [&_th>br:last-child]:hidden [&_th>p]:m-0',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

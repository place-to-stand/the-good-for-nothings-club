export type PriceMenuLine = {
  /** Optional group label, e.g. "Room" / "Staff" — renders once per run. */
  group?: string
  item: string
  price: string
}

/**
 * A menu-card price list: item ····· price, with optional group labels.
 * No boxes or rules — dotted leaders carry the eye to the number.
 */
export default function PriceMenu({ lines }: { lines: PriceMenuLine[] }) {
  const groups = [...new Set(lines.map(line => line.group))]

  return (
    <div className='font-sans text-sm'>
      {groups.map(group => (
        <div key={group ?? 'flat'}>
          {group && (
            <div className='mt-3 mb-1 text-xs font-black tracking-[0.08em] text-black/60 uppercase first:mt-0'>
              {group}
            </div>
          )}
          {lines
            .filter(line => line.group === group)
            .map(line => (
              <div key={line.item} className='flex items-baseline gap-2 py-1'>
                <span>{line.item}</span>
                <span
                  aria-hidden
                  className='min-w-6 flex-1 border-b-2 border-dotted border-black/25'
                />
                <span className='font-bold whitespace-nowrap'>
                  {line.price}
                </span>
              </div>
            ))}
        </div>
      ))}
    </div>
  )
}

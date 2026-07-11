import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'bg-input/10 ring-offset-background focus-visible:border-input hover:border-input/30 flex h-10 w-full rounded-none border-2 border-transparent px-3 py-2 font-sans text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-black/50 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export { Input }

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

/**
 * Hover wipe: a slanted fill grows in from the left and, on the way out,
 * shrinks off to the right, the same path as the link underline. (The
 * origin flips sides at once; only the scale animates.)
 */
const wipe =
  'relative isolate overflow-hidden transition-colors duration-500 ease-out before:absolute before:inset-y-0 before:-inset-x-4 before:-z-10 before:origin-right before:scale-x-0 before:-skew-x-12 before:transition-transform before:duration-500 before:ease-out hover:before:origin-left hover:before:scale-x-100'

const buttonVariants = cva(
  'text-sm font-sans tracking-[1px] uppercase inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: cn(
          wipe,
          'border-2 border-black bg-black text-white before:bg-white hover:text-black'
        ),
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: cn(
          wipe,
          'border-2 border-black bg-transparent text-black before:bg-black hover:text-white'
        ),
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'link-line text-primary',
      },
      size: {
        default: 'h-10 px-6 py-3',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        // Button-styled links never get the hover underline.
        data-button={variant === 'link' ? undefined : ''}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

/**
 * The outline button's hover (the black wipe) for
 * square icon buttons outside <Button>: carousel arrows, quick add.
 * Disabled buttons don't fill.
 */
export const slideFillClassName = cn(
  wipe,
  'before:bg-black hover:text-white disabled:before:hidden'
)

export { Button, buttonVariants }

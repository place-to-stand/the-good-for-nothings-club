import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

/**
 * Hover wipe (see .wipe in globals.css); text colour fades with it. The
 * way out waits 250ms, so a quick pass in and out doesn't swipe twice;
 * coming back in that time just keeps the fill.
 */
const wipe =
  'wipe [transition:color_500ms_ease-out_250ms,background-size_500ms_ease-out_250ms,background-position_0s_250ms] hover:[transition-delay:0s]'

const buttonVariants = cva(
  'text-sm font-sans tracking-[1px] uppercase inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: cn(
          wipe,
          'border-2 border-black bg-black text-white [--wipe:white] hover:text-black'
        ),
        destructive:
          'bg-destructive text-destructive-foreground transition-colors hover:bg-destructive/90',
        outline: cn(
          wipe,
          'border-2 border-black bg-transparent text-black [--wipe:black] hover:text-white'
        ),
        secondary:
          'bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80',
        ghost: 'transition-colors hover:bg-accent hover:text-accent-foreground',
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
  '[--wipe:black] not-disabled:hover:text-white'
)

export { Button, buttonVariants }

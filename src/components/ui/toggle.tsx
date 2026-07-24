import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-[min(var(--radius-md),10px)] text-xs font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[pressed]:bg-primary data-[pressed]:text-primary-foreground data-[pressed]:hover:bg-primary/80",
  {
    variants: {
      size: {
        default: "h-7 px-2.5",
        sm: "h-6 px-2",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function Toggle<Value extends string>({
  className,
  size = "default",
  ...props
}: TogglePrimitive.Props<Value> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive data-slot="toggle" className={cn(toggleVariants({ size, className }))} {...props} />
  )
}

export { Toggle, toggleVariants }

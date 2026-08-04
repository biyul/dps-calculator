import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statusVariants = cva("inline-flex size-2 rounded-full", {
  variants: {
    color: {
      red: "bg-red-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      gray: "bg-neutral-400",
    },
  },
  defaultVariants: {
    color: "gray",
  },
})

interface StatusProps extends VariantProps<typeof statusVariants> {
  className?: string
  pulse?: boolean
}

function Status({ color, pulse = true, className }: StatusProps) {
  return (
    <span data-slot="status" className={cn("relative inline-flex size-2", className)}>
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex size-full animate-ping rounded-full opacity-75",
            statusVariants({ color }),
          )}
        />
      )}
      <span className={cn("relative", statusVariants({ color }))} />
    </span>
  )
}

export { Status }

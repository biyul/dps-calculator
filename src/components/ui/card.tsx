import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card p-3 text-card-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Card }

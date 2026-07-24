import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"

import { cn } from "@/lib/utils"

function ToggleGroup<Value extends string>({
  className,
  ...props
}: ToggleGroupPrimitive.Props<Value>) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn("flex items-center gap-1 rounded-lg border border-border bg-background p-1", className)}
      {...props}
    />
  )
}

export { ToggleGroup }

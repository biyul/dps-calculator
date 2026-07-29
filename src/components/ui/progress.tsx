import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "@/lib/utils"

function toPercent(value: number, min: number, max: number) {
  if (max <= min) return 0
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
}

interface ProgressProps extends ProgressPrimitive.Root.Props {
  // Renders an extra colored segment from `value` up to `secondaryValue`,
  // e.g. to preview a pending change before it's committed.
  secondaryValue?: number
  secondaryClassName?: string
}

function Progress({
  className,
  value,
  min = 0,
  max = 100,
  secondaryValue,
  secondaryClassName,
  ...props
}: ProgressProps) {
  const showSecondary = secondaryValue !== undefined && secondaryValue > (value ?? min)

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn("relative w-full", className)}
      value={value}
      min={min}
      max={max}
      {...props}
    >
      <ProgressPrimitive.Track
        data-slot="progress-track"
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        {showSecondary && (
          <div
            data-slot="progress-secondary"
            className={cn(
              "absolute inset-y-0 left-0 h-full transition-all",
              secondaryClassName ?? "bg-green-500",
            )}
            style={{ width: `${toPercent(secondaryValue, min, max)}%` }}
          />
        )}
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="absolute inset-y-0 left-0 h-full bg-primary transition-all"
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

export { Progress }

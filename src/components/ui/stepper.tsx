import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface StepperStep {
  key: string
  label?: string
}

interface StepperProps {
  steps: StepperStep[]
  currentStep: number
  className?: string
}

function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <ol data-slot="stepper" className={cn("flex w-full items-center", className)}>
      {steps.map((step, index) => {
        const isComplete = index < currentStep
        const isCurrent = index === currentStep

        return (
          <li key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                data-slot="stepper-indicator"
                data-state={isComplete ? "complete" : isCurrent ? "current" : "upcoming"}
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                  isComplete && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isComplete && !isCurrent && "border-border text-muted-foreground",
                )}
              >
                {isComplete ? <Check className="size-3.5" /> : index + 1}
              </div>
              {step.label && (
                <span
                  className={cn(
                    "text-[0.65rem] font-medium whitespace-nowrap",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                data-slot="stepper-separator"
                data-state={isComplete ? "complete" : "upcoming"}
                className={cn("mx-2 h-px flex-1 bg-border transition-colors", isComplete && "bg-primary")}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export { Stepper }

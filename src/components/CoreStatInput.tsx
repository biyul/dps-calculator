import { useEffect, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import type { Stat } from '../stats.ts'

interface CoreStatInputProps {
  stat: Stat
  value: number
  onChange: (value: number) => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export default function CoreStatInput({ stat, value, onChange }: CoreStatInputProps) {
  const { key, label, min, max, unit } = stat
  const [text, setText] = useState(String(value))
  const isZero = value === 0

  useEffect(() => {
    setText(String(value))
  }, [value])

  function applyValue(next: number) {
    setText(String(next))
    onChange(next)
  }

  function commit(rawText: string) {
    const parsed = Number.parseFloat(rawText)
    const next = Number.isFinite(parsed) ? clamp(parsed, min, max) : min
    applyValue(next)
  }

  return (
    <div className="flex items-center gap-3 border-b py-2 text-sm last:border-b-0">
      <Label
        htmlFor={key}
        className={`w-28 shrink-0 flex-col items-start gap-0 font-semibold leading-tight ${isZero ? 'text-muted-foreground/50' : ''}`}
      >
        {label}
        <span className="text-[11px] font-normal text-muted-foreground">
          {min}-{max}
          {unit}
        </span>
      </Label>
      <Progress value={value} min={min} max={max} className="flex-1" />
      <div className={`flex shrink-0 items-center gap-1 ${isZero ? 'text-muted-foreground/50' : ''}`}>
        <Input
          id={key}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
          }}
          className={`h-7 w-14 text-right ${isZero ? 'text-muted-foreground/50' : ''}`}
        />
        <span className="text-muted-foreground">{unit}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label={`Decrease ${label} by 1`}
          onClick={() => applyValue(clamp(value - 1, min, max))}
        >
          <Minus />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label={`Increase ${label} by 1`}
          onClick={() => applyValue(clamp(value + 1, min, max))}
        >
          <Plus />
        </Button>
      </div>
    </div>
  )
}

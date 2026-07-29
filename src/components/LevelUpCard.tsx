import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { CORE_STATS } from '../stats.ts'
import { totalLevelUpCost } from '../levelUpCost.ts'
import type { StatValues } from '../useCombatantStats.ts'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

interface LevelUpCardProps {
  stats: StatValues
  level: number
  xp: number
  onConfirm: (pending: Record<string, number>) => void
}

export default function LevelUpCard({ stats, level, xp, onConfirm }: LevelUpCardProps) {
  const [pending, setPending] = useState<Record<string, number>>({})

  function increment(key: string) {
    setPending((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }))
  }

  function decrement(key: string) {
    setPending((prev) => {
      const next = { ...prev }
      const count = (next[key] ?? 0) - 1
      if (count <= 0) {
        delete next[key]
      } else {
        next[key] = count
      }
      return next
    })
  }

  const totalPending = Object.values(pending).reduce((sum, count) => sum + count, 0)
  const cost = totalLevelUpCost(level, totalPending)
  const canAfford = xp >= cost
  const nextLevelCost = totalLevelUpCost(level, 1)

  return (
    <Card className="w-full max-w-2xl gap-3">
      <h3 className="text-center text-lg font-semibold">Level Up</h3>
      <p className="text-center text-xs text-muted-foreground">
        Level {level} → {level + 1} requires {nextLevelCost} XP. You have {xp} XP.
      </p>

      <div className="flex flex-col">
        {CORE_STATS.map((stat) => {
          const value = stats[stat.key]
          const pendingCount = pending[stat.key] ?? 0
          const displayValue = value + pendingCount
          const atMax = displayValue >= stat.max

          return (
            <div
              key={stat.key}
              className="flex items-center gap-3 border-b py-2 text-sm last:border-b-0"
            >
              <Label className="w-28 shrink-0 flex-col items-start gap-0 font-semibold leading-tight">
                {stat.label}
                <span className="text-[11px] font-normal text-muted-foreground">
                  {stat.min}-{stat.max}
                </span>
              </Label>
              <Progress
                value={value}
                secondaryValue={displayValue}
                min={stat.min}
                max={stat.max}
                className="flex-1"
              />
              <div className="w-28 shrink-0 text-right tabular-nums">
                {value}
                {pendingCount > 0 && <span className="text-green-600"> +{pendingCount}</span>}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  aria-label={`Reduce pending ${stat.label} increase`}
                  disabled={pendingCount === 0}
                  onClick={() => decrement(stat.key)}
                >
                  <Minus />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  aria-label={`Increase ${stat.label}`}
                  disabled={atMax}
                  onClick={() => increment(stat.key)}
                >
                  <Plus />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-2 border-t pt-3">
        <p className="text-center text-sm text-muted-foreground">
          {totalPending > 0 ? (
            <>
              Leveling up {totalPending} time{totalPending > 1 ? 's' : ''} costs {cost} XP. You have{' '}
              {xp} XP.
            </>
          ) : (
            <>Click + on a stat to prepare a level up.</>
          )}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={totalPending === 0}
            onClick={() => setPending({})}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={totalPending === 0 || !canAfford}
            onClick={() => {
              onConfirm(pending)
              setPending({})
            }}
          >
            Confirm
          </Button>
        </div>
        {totalPending > 0 && !canAfford && (
          <p className="text-xs text-red-600">Not enough XP.</p>
        )}
      </div>
    </Card>
  )
}

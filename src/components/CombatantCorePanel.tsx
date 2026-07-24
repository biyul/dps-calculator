import { Minus, Plus } from 'lucide-react'
import { CORE_STATS, type Stat } from '../stats.ts'
import type { StatValues } from '../useCombatantStats.ts'
import CoreStatInput from './CoreStatInput.tsx'
import { Button } from '@/components/ui/button'

interface CombatantCorePanelProps {
  title: string
  stats: StatValues
  onUpdateStat: (key: string, value: number) => void
  onSetAll: (mode: 'min' | 'max', group?: Stat[]) => void
}

export default function CombatantCorePanel({
  title,
  stats,
  onUpdateStat,
  onSetAll,
}: CombatantCorePanelProps) {
  return (
    <div className="flex w-full max-w-lg flex-col">
      <h2 className="pb-3 text-center text-lg font-semibold">{title}</h2>

      <div className="flex justify-end gap-1 pb-2">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label={`Set all ${title} core stats to 0`}
          onClick={() => onSetAll('min', CORE_STATS)}
        >
          <Minus />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label={`Set all ${title} core stats to max`}
          onClick={() => onSetAll('max', CORE_STATS)}
        >
          <Plus />
        </Button>
      </div>

      <section className="flex flex-col">
        {CORE_STATS.map((stat) => (
          <CoreStatInput
            key={stat.key}
            stat={stat}
            value={stats[stat.key]}
            onChange={(value) => onUpdateStat(stat.key, value)}
          />
        ))}
      </section>
    </div>
  )
}

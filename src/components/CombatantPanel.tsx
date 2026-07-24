import { Minus, Plus } from 'lucide-react'
import { CORE_STATS, ATTRIBUTES, getStatBase } from '../stats.ts'
import { getBaseStat } from '../baseStats.ts'
import type { StatValues } from '../useCombatantStats.ts'
import StatInput from './StatInput.tsx'
import { Button } from '@/components/ui/button'

interface CombatantPanelProps {
  title: string
  stats: StatValues
  powerLevel: number
  onUpdateStat: (key: string, value: number) => void
  onSetAll: (mode: 'min' | 'max') => void
}

export default function CombatantPanel({
  title,
  stats,
  powerLevel,
  onUpdateStat,
  onSetAll,
}: CombatantPanelProps) {
  const combatStats = [
    { label: 'Attack', value: getBaseStat('attack') },
    { label: 'HP', value: getBaseStat('hp') },
    { label: 'Block', value: stats.block, unit: '%' },
    { label: 'Crit Chance', value: stats.critChance, unit: '%' },
    { label: 'Crit Damage', value: getStatBase('critDamage') + stats.critDamage, unit: '%' },
    { label: 'Health Regen', value: stats.healthReg, unit: '%' },
    { label: 'Lifesteal', value: stats.lifesteal, unit: '%' },
  ]

  return (
    <div className="flex w-full max-w-lg flex-col">
      <h2 className="pb-3 text-center text-lg font-semibold">{title}</h2>

      <div className="pb-4 text-center">
        <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Power Level
        </div>
        <div className="text-5xl font-bold tabular-nums">{powerLevel}</div>
      </div>

      <div className="mb-4 border-y py-3">
        <div className="mb-2 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Combat Stats
        </div>
        <table className="w-full text-sm">
          <tbody>
            {combatStats.map((stat) => (
              <tr key={stat.label} className="border-b last:border-b-0">
                <td className="py-1 font-semibold">{stat.label}</td>
                <td className="py-1 text-right tabular-nums">
                  {stat.value}
                  {stat.unit ?? ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-1 pb-2">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label={`Set all ${title} stats to 0`}
          onClick={() => onSetAll('min')}
        >
          <Minus />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label={`Set all ${title} stats to max`}
          onClick={() => onSetAll('max')}
        >
          <Plus />
        </Button>
      </div>

      <div className="mb-2 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Core Stats
      </div>
      <section className="mb-4 flex flex-col">
        {CORE_STATS.map((stat) => (
          <StatInput
            key={stat.key}
            stat={stat}
            value={stats[stat.key]}
            onChange={(value) => onUpdateStat(stat.key, value)}
          />
        ))}
      </section>

      <div className="mb-2 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Attributes
      </div>
      <section className="flex flex-col">
        {ATTRIBUTES.map((stat) => (
          <StatInput
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

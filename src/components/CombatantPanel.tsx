import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { CORE_STATS, ATTRIBUTES } from '../stats.ts'
import { COMBAT_STATS, getCombatStat } from '../combatStats.ts'
import { ABILITIES } from '../abilities.ts'
import type { AbilityValues, StatValues } from '../useCombatantStats.ts'
import StatInput from './StatInput.tsx'
import AbilityToggle from './AbilityToggle.tsx'
import { Button } from '@/components/ui/button'

interface CombatantPanelProps {
  title: string
  stats: StatValues
  powerLevel: number
  onUpdateStat: (key: string, value: number) => void
  onSetAll: (mode: 'min' | 'max') => void
  abilities: AbilityValues
  onToggleAbility: (key: string) => void
  abilityOrder: string[]
  onReorderAbilities: (newOrder: string[]) => void
}

export default function CombatantPanel({
  title,
  stats,
  powerLevel,
  onUpdateStat,
  onSetAll,
  abilities,
  onToggleAbility,
  abilityOrder,
  onReorderAbilities,
}: CombatantPanelProps) {
  const [draggedKey, setDraggedKey] = useState<string | null>(null)

  function handleDrop(targetKey: string) {
    if (!draggedKey || draggedKey === targetKey) return
    const newOrder = abilityOrder.filter((key) => key !== draggedKey)
    const targetIndex = newOrder.indexOf(targetKey)
    newOrder.splice(targetIndex, 0, draggedKey)
    onReorderAbilities(newOrder)
  }

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
            {COMBAT_STATS.map((stat) => (
              <tr key={stat.key} className="border-b last:border-b-0">
                <td className="py-1 font-semibold">{stat.label}</td>
                <td className="py-1 text-right tabular-nums">
                  {getCombatStat(stat.key, stats).toFixed(stat.decimals ?? 0)}
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
        Abilities
      </div>
      <section className="mb-4 flex flex-col">
        {abilityOrder.map((key) => {
          const ability = ABILITIES.find((a) => a.key === key)
          if (!ability) return null
          return (
            <AbilityToggle
              key={key}
              ability={ability}
              checked={abilities[key]}
              onChange={() => onToggleAbility(key)}
              isDragging={draggedKey === key}
              onDragStart={() => setDraggedKey(key)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(key)}
              onDragEnd={() => setDraggedKey(null)}
            />
          )
        })}
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

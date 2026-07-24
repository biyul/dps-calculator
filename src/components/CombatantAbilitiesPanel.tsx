import { useState } from 'react'
import { ABILITIES } from '../abilities.ts'
import type { AbilityValues } from '../useCombatantStats.ts'
import AbilityToggle from './AbilityToggle.tsx'

interface CombatantAbilitiesPanelProps {
  title: string
  abilities: AbilityValues
  onToggleAbility: (key: string) => void
  abilityOrder: string[]
  onReorderAbilities: (newOrder: string[]) => void
}

export default function CombatantAbilitiesPanel({
  title,
  abilities,
  onToggleAbility,
  abilityOrder,
  onReorderAbilities,
}: CombatantAbilitiesPanelProps) {
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

      <section className="flex flex-col">
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
    </div>
  )
}

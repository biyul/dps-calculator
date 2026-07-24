import { Minus, Plus } from 'lucide-react'
import { ATTRIBUTES, type Stat } from '../stats.ts'
import { EQUIPMENT, type EquipmentValues } from '../equipment.ts'
import type { StatValues } from '../useCombatantStats.ts'
import StatInput from './StatInput.tsx'
import EquipmentToggle from './EquipmentToggle.tsx'
import { Button } from '@/components/ui/button'

interface CombatantEquipmentPanelProps {
  title: string
  stats: StatValues
  onUpdateStat: (key: string, value: number) => void
  onSetAll: (mode: 'min' | 'max', group?: Stat[]) => void
  equipment?: EquipmentValues
  onToggleEquipment?: (key: string) => void
}

export default function CombatantEquipmentPanel({
  title,
  stats,
  onUpdateStat,
  onSetAll,
  equipment,
  onToggleEquipment,
}: CombatantEquipmentPanelProps) {
  return (
    <div className="flex w-full max-w-lg flex-col">
      <h2 className="pb-3 text-center text-lg font-semibold">{title}</h2>

      {equipment && onToggleEquipment && (
        <>
          <div className="mb-2 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Equipment
          </div>
          <section className="mb-4 flex flex-col">
            {EQUIPMENT.map((item) => (
              <EquipmentToggle
                key={item.key}
                item={item}
                checked={equipment[item.key]}
                onChange={() => onToggleEquipment(item.key)}
              />
            ))}
          </section>
        </>
      )}

      <div className="mb-2 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Attributes
      </div>
      <div className="flex justify-end gap-1 pb-2">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label={`Set all ${title} attributes to 0`}
          onClick={() => onSetAll('min', ATTRIBUTES)}
        >
          <Minus />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label={`Set all ${title} attributes to max`}
          onClick={() => onSetAll('max', ATTRIBUTES)}
        >
          <Plus />
        </Button>
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

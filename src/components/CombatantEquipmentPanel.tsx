import { Minus, Plus } from 'lucide-react'
import { ATTRIBUTES, type Stat } from '../stats.ts'
import { getEquipmentPiece, type InventoryItem } from '../equipment.ts'
import type { StatValues } from '../useCombatantStats.ts'
import StatInput from './StatInput.tsx'
import EquipmentItem from './EquipmentItem.tsx'
import EmptySlotCard from './EmptySlotCard.tsx'
import { Button } from '@/components/ui/button'

interface CombatantEquipmentPanelProps {
  title: string
  stats: StatValues
  onUpdateStat: (key: string, value: number) => void
  onSetAll: (mode: 'min' | 'max', group?: Stat[]) => void
  inventory?: InventoryItem[]
  onAddEquipment?: () => void
  onDeleteEquipment?: (id: string) => void
  onToggleEquip?: (id: string) => void
}

export default function CombatantEquipmentPanel({
  title,
  stats,
  onUpdateStat,
  onSetAll,
  inventory,
  onAddEquipment,
  onDeleteEquipment,
  onToggleEquip,
}: CombatantEquipmentPanelProps) {
  return (
    <div className="flex w-full max-w-lg flex-col">
      <h2 className="pb-3 text-center text-lg font-semibold">{title}</h2>

      {inventory && onAddEquipment && onDeleteEquipment && onToggleEquip && (
        <>
          <div className="mb-2 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Body
          </div>

          <div className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Equipped
          </div>
          <section className="mb-3 flex items-center gap-3">
            <div className="w-14 shrink-0 text-xs font-semibold text-muted-foreground uppercase">
              Body
            </div>
            {(() => {
              const equippedItem = inventory.find((item) => item.equipped)
              if (!equippedItem) return <EmptySlotCard />
              const piece = getEquipmentPiece(equippedItem.key)
              if (!piece) return <EmptySlotCard />
              return (
                <EquipmentItem
                  piece={piece}
                  equipped
                  onDelete={() => onDeleteEquipment(equippedItem.id)}
                  onToggleEquip={() => onToggleEquip(equippedItem.id)}
                />
              )
            })()}
          </section>

          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              Inventory
            </span>
            <Button type="button" size="xs" onClick={onAddEquipment}>
              Add
            </Button>
          </div>
          <section className="mb-4 flex flex-wrap gap-2">
            {inventory
              .filter((item) => !item.equipped)
              .map((item) => {
                const piece = getEquipmentPiece(item.key)
                if (!piece) return null
                return (
                  <EquipmentItem
                    key={item.id}
                    piece={piece}
                    equipped={false}
                    onDelete={() => onDeleteEquipment(item.id)}
                    onToggleEquip={() => onToggleEquip(item.id)}
                  />
                )
              })}
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

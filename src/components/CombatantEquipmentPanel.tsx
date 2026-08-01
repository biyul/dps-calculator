import { Minus, Plus } from 'lucide-react'
import { ATTRIBUTES, type Stat } from '../stats.ts'
import { getEquipmentPiece, SLOT_LABELS, SLOT_ORDER, type InventoryItem } from '../equipment.ts'
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
  onSellEquipment?: (id: string) => void
  onSellAllEquipment?: () => void
  onToggleEquip?: (id: string) => void
}

export default function CombatantEquipmentPanel({
  title,
  stats,
  onUpdateStat,
  onSetAll,
  inventory,
  onAddEquipment,
  onSellEquipment,
  onSellAllEquipment,
  onToggleEquip,
}: CombatantEquipmentPanelProps) {
  return (
    <div className="flex w-full max-w-5xl flex-col">
      <h2 className="pb-3 text-center text-lg font-semibold">{title}</h2>

      {inventory && onAddEquipment && onSellEquipment && onSellAllEquipment && onToggleEquip && (
        <>
          <div className="mb-2 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Equipment
          </div>

          <div className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Equipped
          </div>
          <section className="mb-4 flex flex-wrap gap-4">
            {SLOT_ORDER.map((slot) => {
              const equippedItem = inventory.find(
                (item) => item.equipped && getEquipmentPiece(item.key)?.slot === slot,
              )
              const piece = equippedItem ? getEquipmentPiece(equippedItem.key) : undefined
              return (
                <div key={slot} className="flex flex-col items-center gap-1">
                  <div className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {SLOT_LABELS[slot]}
                  </div>
                  {piece && equippedItem ? (
                    <EquipmentItem
                      piece={piece}
                      level={equippedItem.level}
                      mods={equippedItem.mods}
                      equipped
                      onSell={() => onSellEquipment(equippedItem.id)}
                      onToggleEquip={() => onToggleEquip(equippedItem.id)}
                    />
                  ) : (
                    <EmptySlotCard />
                  )}
                </div>
              )
            })}
          </section>

          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              Inventory
            </span>
            <div className="flex gap-1">
              <Button type="button" variant="outline" size="xs" onClick={onSellAllEquipment}>
                Sell All
              </Button>
              <Button type="button" size="xs" onClick={onAddEquipment}>
                Add
              </Button>
            </div>
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
                    level={item.level}
                    mods={item.mods}
                    equipped={false}
                    onSell={() => onSellEquipment(item.id)}
                    onToggleEquip={() => onToggleEquip(item.id)}
                  />
                )
              })}
          </section>
        </>
      )}

      <div className="mx-auto w-full max-w-lg">
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
    </div>
  )
}

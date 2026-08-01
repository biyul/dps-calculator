import { getLeveledStat, getModDef, MAX_ITEM_MODS, type EquipmentPiece, type ItemMod } from '../equipment.ts'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface EquipmentItemProps {
  piece: EquipmentPiece
  level: number
  mods: ItemMod[]
  equipped: boolean
  onSell: () => void
  onToggleEquip: () => void
}

const STAT_FIELDS: { key: 'hp' | 'mp' | 'armour' | 'resist' | 'speed'; label: string; unit?: string }[] = [
  { key: 'hp', label: 'HP' },
  { key: 'mp', label: 'MP' },
  { key: 'armour', label: 'Armour' },
  { key: 'resist', label: 'Resist' },
  { key: 'speed', label: 'Speed', unit: '%' },
]

function statColor(value: number) {
  if (value > 0) return 'text-green-600'
  if (value < 0) return 'text-red-600'
  return 'text-neutral-500'
}

export default function EquipmentItem({ piece, level, mods, equipped, onSell, onToggleEquip }: EquipmentItemProps) {
  return (
    <Card className="w-44 shrink-0 text-sm">
      <div className="text-center">
        <div className="font-semibold">{piece.label}</div>
        <div className="text-[10px] text-muted-foreground">Level {level}</div>
        <div className="text-[10px] text-muted-foreground uppercase">{piece.type}</div>
      </div>
      <table className="w-full text-xs">
        <tbody>
          {STAT_FIELDS.map(({ key, label, unit }) => {
            const value = key === 'speed' ? piece.speed : getLeveledStat(piece, level, key)
            return (
              <tr key={key} className="border-b last:border-b-0">
                <td className="py-0.5 text-muted-foreground">{label}</td>
                <td className={`py-0.5 text-right font-bold tabular-nums ${statColor(value)}`}>
                  {value > 0 ? '+' : ''}
                  {value}
                  {unit ?? ''}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="text-center text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        Mods
      </div>
      <table className="w-full text-xs">
        <tbody>
          {Array.from({ length: MAX_ITEM_MODS }, (_, i) => {
            const mod = mods[i]
            const modDef = mod ? getModDef(mod.key) : undefined
            return (
              <tr key={i} className="border-b last:border-b-0">
                {mod && modDef ? (
                  <>
                    <td className="py-0.5 text-muted-foreground">{modDef.label}</td>
                    <td className="py-0.5 text-right font-bold tabular-nums text-green-600">
                      +{mod.value}
                      {modDef.unit}
                    </td>
                  </>
                ) : (
                  <td colSpan={2} className="py-0.5 text-center text-muted-foreground">
                    -
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="flex gap-1">
        <Button type="button" variant="outline" size="xs" className="flex-1" onClick={onSell}>
          Sell
        </Button>
        <Button
          type="button"
          variant={equipped ? 'default' : 'outline'}
          size="xs"
          className="flex-1"
          onClick={onToggleEquip}
        >
          {equipped ? 'Unequip' : 'Equip'}
        </Button>
      </div>
    </Card>
  )
}

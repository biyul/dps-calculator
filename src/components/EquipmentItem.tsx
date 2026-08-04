import { getLeveledStat, getModDef, MAX_ITEM_MODS, type EquipmentPiece, type ItemMod } from '../equipment.ts'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface EquipmentItemProps {
  piece: EquipmentPiece
  level: number
  mods: ItemMod[]
  equipped: boolean
  debug?: boolean
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

export default function EquipmentItem({
  piece,
  level,
  mods,
  equipped,
  debug,
  onSell,
  onToggleEquip,
}: EquipmentItemProps) {
  return (
    <Card className="w-44 shrink-0 text-sm">
      <div className="text-center">
        <div className="font-semibold">{piece.label}</div>
        <div className="text-[10px] text-muted-foreground">Level {level}</div>
        <div className="text-[10px] text-muted-foreground uppercase">{piece.type}</div>
      </div>
      <table className="w-full text-xs">
        <tbody className="divide-y">
          {STAT_FIELDS.map(({ key, label, unit }) => {
            const value = key === 'speed' ? piece.speed : getLeveledStat(piece, level, key)
            const showBase = debug
            return (
              <tr key={key}>
                <td className="py-0.5 text-muted-foreground">{label}</td>
                <td className="py-0.5 text-right">
                  <div className={`font-bold tabular-nums ${statColor(value)}`}>
                    {value > 0 ? '+' : ''}
                    {value}
                    {unit ?? ''}
                  </div>
                  {showBase && (
                    <div className="text-[10px] font-normal text-muted-foreground">
                      Base: {piece[key]}
                      {unit ?? ''}
                    </div>
                  )}
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
        <tbody className="divide-y">
          {Array.from({ length: MAX_ITEM_MODS }, (_, i) => {
            const mod = mods[i]
            const modDef = mod ? getModDef(mod.key) : undefined
            const showRange = debug && modDef
            return (
              <tr key={i}>
                {mod && modDef ? (
                  <>
                    <td className="py-0.5 text-muted-foreground">{modDef.label}</td>
                    <td className="py-0.5 text-right">
                      <div className="font-bold tabular-nums text-green-600">
                        +{mod.value}
                        {modDef.unit}
                      </div>
                      {showRange && (
                        <div className="text-[10px] font-normal text-muted-foreground">
                          Base: 1-{modDef.max}
                          {modDef.unit}
                        </div>
                      )}
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

import type { EquipmentPiece } from '../equipment.ts'
import { Label } from './ui/label'
import { Switch } from './ui/switch'

interface EquipmentToggleProps {
  item: EquipmentPiece
  checked: boolean
  onChange: (checked: boolean) => void
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

export default function EquipmentToggle({ item, checked, onChange }: EquipmentToggleProps) {
  return (
    <div className="flex flex-col gap-2 border-b py-2 text-sm last:border-b-0">
      <div className="flex items-center gap-2">
        <Label
          htmlFor={item.key}
          className={`flex-1 font-semibold ${checked ? '' : 'text-muted-foreground/50'}`}
        >
          {item.label}
          <span className="font-normal text-muted-foreground">({item.type})</span>
        </Label>
        <Switch id={item.key} checked={checked} onCheckedChange={onChange} />
      </div>
      <table className="w-full text-xs">
        <tbody>
          {STAT_FIELDS.map(({ key, label, unit }) => {
            const value = item[key]
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
    </div>
  )
}

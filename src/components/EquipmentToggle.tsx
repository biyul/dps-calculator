import type { EquipmentPiece } from '../equipment.ts'
import { Label } from './ui/label'
import { Switch } from './ui/switch'

interface EquipmentToggleProps {
  item: EquipmentPiece
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function EquipmentToggle({ item, checked, onChange }: EquipmentToggleProps) {
  return (
    <div className="flex items-center gap-2 border-b py-2 text-sm last:border-b-0">
      <Label
        htmlFor={item.key}
        className={`flex-1 font-semibold ${checked ? '' : 'text-muted-foreground/50'}`}
      >
        {item.label}
      </Label>
      <Switch id={item.key} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

import type { Ability } from '../abilities.ts'
import { Label } from './ui/label'
import { Switch } from './ui/switch'

interface AbilityToggleProps {
  ability: Ability
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function AbilityToggle({ ability, checked, onChange }: AbilityToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b py-2 text-sm last:border-b-0">
      <Label
        htmlFor={ability.key}
        className={`font-semibold ${checked ? '' : 'text-muted-foreground/50'}`}
      >
        {ability.label}
        {ability.mpCost !== undefined ? ` (MP: ${ability.mpCost})` : ''}
      </Label>
      <Switch id={ability.key} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

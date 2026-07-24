import type { DragEvent } from 'react'
import { GripVertical } from 'lucide-react'
import type { Ability } from '../abilities.ts'
import { Label } from './ui/label'
import { Switch } from './ui/switch'

interface AbilityToggleProps {
  ability: Ability
  checked: boolean
  onChange: (checked: boolean) => void
  isDragging: boolean
  onDragStart: () => void
  onDragOver: (event: DragEvent) => void
  onDrop: () => void
  onDragEnd: () => void
}

export default function AbilityToggle({
  ability,
  checked,
  onChange,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: AbilityToggleProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`flex items-center gap-2 border-b py-2 text-sm last:border-b-0 ${isDragging ? 'opacity-40' : ''}`}
    >
      <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />
      <Label
        htmlFor={ability.key}
        className={`flex-1 font-semibold ${checked ? '' : 'text-muted-foreground/50'}`}
      >
        {ability.label}
        {ability.mpCost !== undefined ? ` (MP: ${ability.mpCost})` : ''}
      </Label>
      <Switch id={ability.key} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

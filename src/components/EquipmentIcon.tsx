import { GitCommitHorizontal, Hand, HardHat, Shirt, SportShoe } from 'lucide-react'
import type { EquipmentSlot, EquipmentType } from '../equipment.ts'

interface EquipmentIconProps {
  slot: EquipmentSlot
  type: EquipmentType
  level: number
}

const TYPE_LETTER: Record<EquipmentType, string> = {
  Light: 'L',
  Heavy: 'H',
  Mystic: 'M',
}

const SLOT_ICON: Record<EquipmentSlot, typeof Shirt> = {
  head: HardHat,
  body: Shirt,
  arms: Hand,
  waist: GitCommitHorizontal,
  legs: SportShoe,
}

export default function EquipmentIcon({ slot, type, level }: EquipmentIconProps) {
  const Icon = SLOT_ICON[slot]
  return (
    <div className="relative mx-auto size-14">
      <div className="flex size-full items-center justify-center rounded-full border bg-muted">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <div className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full border bg-background text-[10px] font-bold">
        {TYPE_LETTER[type]}
      </div>
      <div className="absolute -right-1 -bottom-1 flex h-5 min-w-5 items-center justify-center rounded-full border bg-background px-1 text-[10px] font-bold tabular-nums">
        {level}
      </div>
    </div>
  )
}

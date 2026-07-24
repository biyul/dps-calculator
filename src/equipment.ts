// Equipment definitions for the DPS calculator. Each piece is a simple on/off toggle
// (no rolls, no multiple copies) that contributes flat HP/MP/Armour/Resist.
export type EquipmentSlot = 'body'

export interface EquipmentPiece {
  key: string
  label: string
  slot: EquipmentSlot
  hp: number
  mp: number
  armour: number
  resist: number
}

export const EQUIPMENT: EquipmentPiece[] = [
  { key: 'leatherArmour', label: 'Leather Armour', slot: 'body', hp: 50, mp: 0, armour: 10, resist: 0 },
]

export type EquipmentValues = Record<string, boolean>

export function getEquipmentTotal(
  equipment: EquipmentValues,
  field: 'hp' | 'mp' | 'armour' | 'resist',
): number {
  return EQUIPMENT.filter((item) => equipment[item.key]).reduce((sum, item) => sum + item[field], 0)
}

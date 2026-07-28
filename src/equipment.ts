// Equipment definitions for the DPS calculator. Each piece is a simple on/off toggle
// (no rolls, no multiple copies) that contributes flat HP/MP/Armour/Resist/Speed.
export type EquipmentSlot = 'body'
export type EquipmentType = 'Light' | 'Heavy' | 'Mystic'

export interface EquipmentPiece {
  key: string
  label: string
  slot: EquipmentSlot
  type: EquipmentType
  hp: number
  mp: number
  armour: number
  resist: number
  speed: number
}

export const EQUIPMENT: EquipmentPiece[] = [
  {
    key: 'leatherArmour',
    label: 'Leather Armour',
    slot: 'body',
    type: 'Light',
    hp: 50,
    mp: 0,
    armour: 10,
    resist: 0,
    speed: -5,
  },
]

export type EquipmentValues = Record<string, boolean>

export function getEquipmentTotal(
  equipment: EquipmentValues,
  field: 'hp' | 'mp' | 'armour' | 'resist' | 'speed',
): number {
  return EQUIPMENT.filter((item) => equipment[item.key]).reduce((sum, item) => sum + item[field], 0)
}

// Equipment definitions for the DPS calculator. Definitions are static templates;
// a combatant's actual gear is a list of owned instances (see InventoryItem) so
// duplicates of the same definition are possible.
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
  {
    key: 'leatherPlate',
    label: 'Leather Plate',
    slot: 'body',
    type: 'Heavy',
    hp: 100,
    mp: 0,
    armour: 20,
    resist: 0,
    speed: -10,
  },
  {
    key: 'cottonShirt',
    label: 'Cotton Shirt',
    slot: 'body',
    type: 'Mystic',
    hp: 50,
    mp: 25,
    armour: 5,
    resist: 0,
    speed: -7,
  },
]

export interface InventoryItem {
  id: string
  key: string
  equipped: boolean
}

export function getEquipmentPiece(key: string): EquipmentPiece | undefined {
  return EQUIPMENT.find((item) => item.key === key)
}

export function getEquipmentTotal(
  inventory: InventoryItem[],
  field: 'hp' | 'mp' | 'armour' | 'resist' | 'speed',
): number {
  return inventory
    .filter((item) => item.equipped)
    .map((item) => getEquipmentPiece(item.key))
    .filter((piece): piece is EquipmentPiece => piece !== undefined)
    .reduce((sum, piece) => sum + piece[field], 0)
}

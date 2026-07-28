// Equipment definitions for the DPS calculator. Definitions are static templates;
// a combatant's actual gear is a list of owned instances (see InventoryItem) so
// duplicates of the same definition are possible.
export type EquipmentSlot = 'head' | 'body' | 'arms' | 'waist' | 'legs'
export type EquipmentType = 'Light' | 'Heavy' | 'Mystic'

export const SLOT_ORDER: EquipmentSlot[] = ['head', 'body', 'arms', 'waist', 'legs']

export const SLOT_LABELS: Record<EquipmentSlot, string> = {
  head: 'Head',
  body: 'Body',
  arms: 'Arms',
  waist: 'Waist',
  legs: 'Legs',
}

// Each item's family name, by slot (e.g. "Light Helmet" for the head slot).
const SLOT_ITEM_NAME: Record<EquipmentSlot, string> = {
  head: 'Helmet',
  body: 'Plate',
  arms: 'Gloves',
  waist: 'Belt',
  legs: 'Boots',
}

const TYPES: EquipmentType[] = ['Light', 'Heavy', 'Mystic']

// Stats are the same for a given Type regardless of which slot it's worn in.
const TYPE_STATS: Record<EquipmentType, { hp: number; mp: number; armour: number; resist: number; speed: number }> = {
  Light: { hp: 50, mp: 0, armour: 10, resist: 0, speed: -5 },
  Heavy: { hp: 100, mp: 0, armour: 20, resist: 0, speed: -10 },
  Mystic: { hp: 50, mp: 25, armour: 5, resist: 0, speed: -7 },
}

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

export const EQUIPMENT: EquipmentPiece[] = SLOT_ORDER.flatMap((slot) =>
  TYPES.map((type) => ({
    key: `${slot}-${type.toLowerCase()}`,
    label: `${type} ${SLOT_ITEM_NAME[slot]}`,
    slot,
    type,
    ...TYPE_STATS[type],
  })),
)

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

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

export const MIN_EQUIPMENT_LEVEL = 1
export const MAX_EQUIPMENT_LEVEL = 100

export function randomEquipmentLevel(): number {
  return Math.floor(Math.random() * MAX_EQUIPMENT_LEVEL) + MIN_EQUIPMENT_LEVEL
}

// Level 1 -> 100% of base stats. Level 100 -> 250% of base stats, scaling linearly in between.
function getLevelMultiplier(level: number): number {
  return 1 + ((level - MIN_EQUIPMENT_LEVEL) / (MAX_EQUIPMENT_LEVEL - MIN_EQUIPMENT_LEVEL)) * 1.5
}

// Stats that scale with an equipped item's Level. Speed is deliberately excluded:
// it always stays at its base value regardless of Level.
export type LeveledStatField = 'hp' | 'mp' | 'armour' | 'resist'

// The base stat, scaled by the item's Level. This is what actually gets factored
// into a combatant's stats; the raw EquipmentPiece fields are the Level-1 baseline.
export function getLeveledStat(piece: EquipmentPiece, level: number, field: LeveledStatField): number {
  return Math.ceil(piece[field] * getLevelMultiplier(level))
}

export interface InventoryItem {
  id: string
  key: string
  level: number
  equipped: boolean
}

export function getEquipmentPiece(key: string): EquipmentPiece | undefined {
  return EQUIPMENT.find((item) => item.key === key)
}

export function getEquipmentTotal(
  inventory: InventoryItem[],
  field: LeveledStatField | 'speed',
): number {
  return inventory
    .filter((item) => item.equipped)
    .reduce((sum, item) => {
      const piece = getEquipmentPiece(item.key)
      if (!piece) return sum
      return sum + (field === 'speed' ? piece.speed : getLeveledStat(piece, item.level, field))
    }, 0)
}

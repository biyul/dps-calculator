// Equipment definitions for the DPS calculator. Definitions are static templates;
// a combatant's actual gear is a list of owned instances (see InventoryItem) so
// duplicates of the same definition are possible.
import { ATTRIBUTES } from './stats.ts'

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

// Random stat mods an item can roll, independent of the item's Level.
export type ModKey = 'block' | 'speed' | 'critChance' | 'critDamage' | 'healthReg' | 'lifesteal'

const MOD_MAX: Record<ModKey, number> = {
  block: 5,
  speed: 5,
  critChance: 10,
  critDamage: 25,
  healthReg: 5,
  lifesteal: 5,
}

const MOD_KEYS = Object.keys(MOD_MAX) as ModKey[]

export const MAX_ITEM_MODS = 2

export interface ModDef {
  key: ModKey
  label: string
  unit: string
  max: number
}

export const MODS: ModDef[] = MOD_KEYS.map((key) => {
  const attribute = ATTRIBUTES.find((a) => a.key === key)
  return { key, label: attribute?.label ?? key, unit: attribute?.unit ?? '%', max: MOD_MAX[key] }
})

export function getModDef(key: ModKey): ModDef | undefined {
  return MODS.find((mod) => mod.key === key)
}

export interface ItemMod {
  key: ModKey
  value: number
}

// Rolls 0-2 mods for a newly dropped item, each a different stat, each with a
// random value from 1 up to that mod's max.
export function rollItemMods(): ItemMod[] {
  const modCount = Math.floor(Math.random() * (MAX_ITEM_MODS + 1))
  const shuffled = [...MODS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, modCount).map((mod) => ({
    key: mod.key,
    value: Math.floor(Math.random() * mod.max) + 1,
  }))
}

export interface InventoryItem {
  id: string
  key: string
  level: number
  equipped: boolean
  mods: ItemMod[]
}

export function getEquipmentPiece(key: string): EquipmentPiece | undefined {
  return EQUIPMENT.find((item) => item.key === key)
}

// Rolls a brand new random item instance (random piece, level, and mods) without
// adding it to anyone's inventory, so callers can hold onto it first (e.g. the
// Blacksmith storing a forged item until it's collected).
export function createRandomEquipmentItem(): InventoryItem {
  const picked = EQUIPMENT[Math.floor(Math.random() * EQUIPMENT.length)]
  return {
    id: crypto.randomUUID(),
    key: picked.key,
    level: randomEquipmentLevel(),
    equipped: false,
    mods: rollItemMods(),
  }
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

// Mods are not scaled by the item's Level.
export function getEquipmentModTotal(inventory: InventoryItem[], key: ModKey): number {
  return inventory
    .filter((item) => item.equipped)
    .reduce((sum, item) => sum + (item.mods.find((mod) => mod.key === key)?.value ?? 0), 0)
}

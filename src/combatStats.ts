// Combat Stats: read-only values derived from base stats, core stats, attributes, and equipment.
import { getBaseStat } from './baseStats.ts'
import { getStatBase } from './stats.ts'
import { getEquipmentTotal, getEquipmentModTotal, type InventoryItem } from './equipment.ts'
import type { StatValues } from './useCombatantStats.ts'

export interface CombatStat {
  key: string
  label: string
  unit?: string
  decimals?: number
}

export const COMBAT_STATS: CombatStat[] = [
  { key: 'attack', label: 'Attack' },
  { key: 'hp', label: 'HP' },
  { key: 'mp', label: 'MP' },
  { key: 'armour', label: 'Armour' },
  { key: 'resist', label: 'Resist' },
  { key: 'block', label: 'Block', unit: '%' },
  { key: 'critChance', label: 'Crit Chance', unit: '%' },
  { key: 'critDamage', label: 'Crit Damage', unit: '%' },
  { key: 'lifesteal', label: 'Lifesteal', unit: '%' },
  { key: 'healthReg', label: 'HP Regen', unit: '%' },
  { key: 'mpRegen', label: 'MP Regen' },
  { key: 'speed', label: 'Speed', unit: '%' },
]

export function getCombatStat(
  key: string,
  stats: StatValues,
  inventory: InventoryItem[] = [],
): number {
  switch (key) {
    case 'attack':
      return getBaseStat('attack') + stats.strength
    case 'hp':
      return getBaseStat('hp') + stats.strength * 10 + getEquipmentTotal(inventory, 'hp')
    case 'mp':
      return getBaseStat('mp') + getEquipmentTotal(inventory, 'mp')
    case 'armour':
      return getEquipmentTotal(inventory, 'armour')
    case 'resist':
      return getEquipmentTotal(inventory, 'resist')
    case 'block':
      return stats.block + getEquipmentModTotal(inventory, 'block')
    case 'critChance':
      return stats.dexterity + stats.critChance + getEquipmentModTotal(inventory, 'critChance')
    case 'critDamage':
      return getStatBase('critDamage') + stats.critDamage + getEquipmentModTotal(inventory, 'critDamage')
    case 'healthReg':
      return stats.healthReg + getEquipmentModTotal(inventory, 'healthReg')
    case 'lifesteal':
      return stats.lifesteal + getEquipmentModTotal(inventory, 'lifesteal')
    case 'mpRegen':
      return getBaseStat('mpRegen') + stats.intelligence
    case 'speed':
      return (
        100 +
        stats.speed +
        getEquipmentTotal(inventory, 'speed') +
        getEquipmentModTotal(inventory, 'speed')
      )
    default:
      throw new Error(`Unknown combat stat: ${key}`)
  }
}

// The bonus a Combat Stat gets specifically from a Core Stat (Strength/Dexterity/Intelligence).
function getCoreBonus(key: string, stats: StatValues): number {
  switch (key) {
    case 'attack':
      return stats.strength
    case 'hp':
      return stats.strength * 10
    case 'critChance':
      return stats.dexterity
    case 'mpRegen':
      return stats.intelligence
    default:
      return 0
  }
}

// The bonus a Combat Stat gets specifically from equipped gear.
function getEquipBonus(key: string, inventory: InventoryItem[]): number {
  switch (key) {
    case 'hp':
      return getEquipmentTotal(inventory, 'hp')
    case 'mp':
      return getEquipmentTotal(inventory, 'mp')
    case 'armour':
      return getEquipmentTotal(inventory, 'armour')
    case 'resist':
      return getEquipmentTotal(inventory, 'resist')
    case 'speed':
      return getEquipmentTotal(inventory, 'speed') + getEquipmentModTotal(inventory, 'speed')
    case 'block':
      return getEquipmentModTotal(inventory, 'block')
    case 'critChance':
      return getEquipmentModTotal(inventory, 'critChance')
    case 'critDamage':
      return getEquipmentModTotal(inventory, 'critDamage')
    case 'healthReg':
      return getEquipmentModTotal(inventory, 'healthReg')
    case 'lifesteal':
      return getEquipmentModTotal(inventory, 'lifesteal')
    default:
      return 0
  }
}

export interface CombatStatBreakdown {
  total: number
  base: number
  core: number
  equip: number
}

// Total is the same value getCombatStat returns; Base is whatever's left over
// once the Core Stat and Equipment contributions are accounted for, so the
// three columns always add up exactly to Total.
export function getCombatStatBreakdown(
  key: string,
  stats: StatValues,
  inventory: InventoryItem[] = [],
): CombatStatBreakdown {
  const total = getCombatStat(key, stats, inventory)
  const core = getCoreBonus(key, stats)
  const equip = getEquipBonus(key, inventory)
  const base = total - core - equip
  return { total, base, core, equip }
}

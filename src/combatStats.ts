// Combat Stats: read-only values derived from base stats, core stats, attributes, and equipment.
import { getBaseStat } from './baseStats.ts'
import { getStatBase } from './stats.ts'
import { getEquipmentTotal, type EquipmentValues } from './equipment.ts'
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
  equipment: EquipmentValues = {},
): number {
  switch (key) {
    case 'attack':
      return getBaseStat('attack') + stats.strength
    case 'hp':
      return getBaseStat('hp') + stats.strength * 10 + getEquipmentTotal(equipment, 'hp')
    case 'mp':
      return getBaseStat('mp') + getEquipmentTotal(equipment, 'mp')
    case 'armour':
      return getEquipmentTotal(equipment, 'armour')
    case 'resist':
      return getEquipmentTotal(equipment, 'resist')
    case 'block':
      return stats.block
    case 'critChance':
      return stats.dexterity + stats.critChance
    case 'critDamage':
      return getStatBase('critDamage') + stats.critDamage
    case 'healthReg':
      return stats.healthReg
    case 'lifesteal':
      return stats.lifesteal
    case 'mpRegen':
      return getBaseStat('mpRegen') + stats.intelligence
    case 'speed':
      return 100 + stats.speed
    default:
      throw new Error(`Unknown combat stat: ${key}`)
  }
}

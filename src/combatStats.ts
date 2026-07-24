// Combat Stats: read-only values derived from base stats, core stats, and attributes.
import { getBaseStat } from './baseStats.ts'
import { getStatBase } from './stats.ts'
import type { StatValues } from './useCombatantStats.ts'

export interface CombatStat {
  key: string
  label: string
  unit?: string
}

export const COMBAT_STATS: CombatStat[] = [
  { key: 'attack', label: 'Attack' },
  { key: 'hp', label: 'HP' },
  { key: 'block', label: 'Block', unit: '%' },
  { key: 'critChance', label: 'Crit Chance', unit: '%' },
  { key: 'critDamage', label: 'Crit Damage', unit: '%' },
  { key: 'healthReg', label: 'Health Regen', unit: '%' },
  { key: 'lifesteal', label: 'Lifesteal', unit: '%' },
  { key: 'mpRegen', label: 'MP Regen' },
  { key: 'mp', label: 'MP' },
]

export function getCombatStat(key: string, stats: StatValues): number {
  switch (key) {
    case 'attack':
      return getBaseStat('attack') + stats.strength
    case 'hp':
      return getBaseStat('hp') + stats.strength * 10
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
    case 'mp':
      return getBaseStat('mp')
    default:
      throw new Error(`Unknown combat stat: ${key}`)
  }
}

// Stat definitions for the DPS calculator.
// `base` is the value a character has even with 0 invested (only crit damage has one).
export interface Stat {
  key: string
  label: string
  min: number
  max: number
  unit: string
  base?: number
}

export const STATS: Stat[] = [
  { key: 'block', label: 'Block', min: 0, max: 100, unit: '%' },
  { key: 'attackSpeed', label: 'Att Speed', min: 0, max: 40, unit: '%' },
  { key: 'critChance', label: 'Crit Chance', min: 0, max: 100, unit: '%' },
  { key: 'critDamage', label: 'Crit Damage', min: 0, max: 80, unit: '%', base: 20 },
  { key: 'healthReg', label: 'Health Reg', min: 0, max: 4, unit: '%' },
  { key: 'lifesteal', label: 'Lifesteal', min: 0, max: 20, unit: '%' },
]

export function getStatBase(key: string): number {
  return STATS.find((s) => s.key === key)?.base ?? 0
}

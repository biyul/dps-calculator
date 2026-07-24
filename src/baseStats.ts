// Base character stats. Fixed for now; will likely become derived/editable later.
export interface BaseStat {
  key: string
  label: string
  value: number
  unit?: string
  decimals?: number
}

export const BASE_STATS: BaseStat[] = [
  { key: 'attack', label: 'Attack', value: 100 },
  { key: 'hp', label: 'HP', value: 1000 },
  { key: 'attackSpeed', label: 'Attack Speed', value: 1, unit: '/s', decimals: 2 },
  { key: 'mpRegen', label: 'MP Regen', value: 10 },
  { key: 'mp', label: 'MP', value: 0 },
]

export function getBaseStat(key: string): number {
  const stat = BASE_STATS.find((s) => s.key === key)
  if (!stat) throw new Error(`Unknown base stat: ${key}`)
  return stat.value
}

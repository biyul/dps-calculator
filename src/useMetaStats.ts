// Meta stats: tied to the user/player of the app (progression), not any combatant.
import { useState } from 'react'

export interface MetaStat {
  key: string
  label: string
}

export const META_STATS: MetaStat[] = [
  { key: 'level', label: 'Level' },
  { key: 'gold', label: 'Gold' },
  { key: 'xp', label: 'XP' },
]

export type MetaStatValues = Record<string, number>

const initialMetaStats: MetaStatValues = Object.fromEntries(META_STATS.map((s) => [s.key, 0]))

export function useMetaStats() {
  const [metaStats, setMetaStats] = useState<MetaStatValues>(initialMetaStats)
  const [keyItemKeys, setKeyItemKeys] = useState<string[]>([])

  function addKeyItem(key: string) {
    setKeyItemKeys((prev) => (prev.includes(key) ? prev : [...prev, key]))
  }

  return { metaStats, setMetaStats, keyItemKeys, addKeyItem }
}

import { useMemo, useState } from 'react'
import { STATS, CORE_STATS } from './stats.ts'

export type StatValues = Record<string, number>

const initialStats: StatValues = Object.fromEntries(STATS.map((s) => [s.key, s.min]))

export function useCombatantStats() {
  const [stats, setStats] = useState<StatValues>(initialStats)

  const powerLevel = useMemo(() => {
    const total = CORE_STATS.reduce((sum, stat) => {
      const value = stats[stat.key]
      return sum + ((value - stat.min) / (stat.max - stat.min)) * 100
    }, 0)
    return Math.round(total)
  }, [stats])

  function updateStat(key: string, value: number) {
    setStats((prev) => ({ ...prev, [key]: value }))
  }

  function setAllStats(mode: 'min' | 'max') {
    setStats(Object.fromEntries(STATS.map((s) => [s.key, mode === 'max' ? s.max : 0])))
  }

  return { stats, powerLevel, updateStat, setAllStats }
}

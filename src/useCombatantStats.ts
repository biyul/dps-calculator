import { useMemo, useState } from 'react'
import { STATS, CORE_STATS, type Stat } from './stats.ts'
import { ABILITIES } from './abilities.ts'
import { EQUIPMENT, type EquipmentValues } from './equipment.ts'

export type StatValues = Record<string, number>
export type AbilityValues = Record<string, boolean>

const initialStats: StatValues = Object.fromEntries(STATS.map((s) => [s.key, s.min]))
const initialAbilities: AbilityValues = Object.fromEntries(ABILITIES.map((a) => [a.key, false]))
const initialAbilityOrder: string[] = ABILITIES.map((a) => a.key)
const initialEquipment: EquipmentValues = Object.fromEntries(EQUIPMENT.map((e) => [e.key, false]))

export function useCombatantStats() {
  const [stats, setStats] = useState<StatValues>(initialStats)
  const [abilities, setAbilities] = useState<AbilityValues>(initialAbilities)
  const [abilityOrder, setAbilityOrder] = useState<string[]>(initialAbilityOrder)
  const [equipment, setEquipment] = useState<EquipmentValues>(initialEquipment)

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

  function setAllStats(mode: 'min' | 'max', group: Stat[] = STATS) {
    setStats((prev) => ({
      ...prev,
      ...Object.fromEntries(group.map((s) => [s.key, mode === 'max' ? s.max : 0])),
    }))
  }

  function toggleAbility(key: string) {
    setAbilities((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function reorderAbilities(newOrder: string[]) {
    setAbilityOrder(newOrder)
  }

  function toggleEquipment(key: string) {
    setEquipment((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return {
    stats,
    powerLevel,
    updateStat,
    setAllStats,
    abilities,
    toggleAbility,
    abilityOrder,
    reorderAbilities,
    equipment,
    toggleEquipment,
  }
}

import { useMemo, useState } from 'react'
import { STATS, CORE_STATS, type Stat } from './stats.ts'
import { ABILITIES } from './abilities.ts'
import { EQUIPMENT, getEquipmentPiece, randomEquipmentLevel, type InventoryItem } from './equipment.ts'

export type StatValues = Record<string, number>
export type AbilityValues = Record<string, boolean>

const initialAbilities: AbilityValues = Object.fromEntries(ABILITIES.map((a) => [a.key, false]))
const initialAbilityOrder: string[] = ABILITIES.map((a) => a.key)

export function useCombatantStats(
  options: { coreStatsBase?: number; initialStats?: Partial<StatValues> } = {},
) {
  const { coreStatsBase, initialStats } = options
  const [stats, setStats] = useState<StatValues>(() =>
    Object.fromEntries(
      STATS.map((s) => [
        s.key,
        initialStats?.[s.key] ??
          (coreStatsBase !== undefined && CORE_STATS.some((c) => c.key === s.key) ? coreStatsBase : s.min),
      ]),
    ),
  )
  const [abilities, setAbilities] = useState<AbilityValues>(initialAbilities)
  const [abilityOrder, setAbilityOrder] = useState<string[]>(initialAbilityOrder)
  const [inventory, setInventory] = useState<InventoryItem[]>([])

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

  function setStatsBulk(overrides: Record<string, number>) {
    setStats((prev) => ({ ...prev, ...overrides }))
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

  function addRandomEquipment(): InventoryItem {
    const picked = EQUIPMENT[Math.floor(Math.random() * EQUIPMENT.length)]
    const item: InventoryItem = {
      id: crypto.randomUUID(),
      key: picked.key,
      level: randomEquipmentLevel(),
      equipped: false,
    }
    setInventory((prev) => [...prev, item])
    return item
  }

  function sellEquipment(id: string) {
    setInventory((prev) => prev.filter((item) => item.id !== id))
  }

  function sellAllEquipment() {
    setInventory((prev) => prev.filter((item) => item.equipped))
  }

  function toggleEquip(id: string) {
    setInventory((prev) => {
      const target = prev.find((item) => item.id === id)
      if (!target) return prev
      const targetPiece = getEquipmentPiece(target.key)
      const nextEquipped = !target.equipped

      return prev.map((item) => {
        if (item.id === id) return { ...item, equipped: nextEquipped }
        if (!nextEquipped || !targetPiece) return item
        const piece = getEquipmentPiece(item.key)
        if (piece && piece.slot === targetPiece.slot) return { ...item, equipped: false }
        return item
      })
    })
  }

  return {
    stats,
    powerLevel,
    updateStat,
    setStatsBulk,
    setAllStats,
    abilities,
    toggleAbility,
    abilityOrder,
    reorderAbilities,
    inventory,
    addRandomEquipment,
    sellEquipment,
    sellAllEquipment,
    toggleEquip,
  }
}

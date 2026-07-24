import { COMBAT_STATS, getCombatStat } from '../combatStats.ts'
import type { EquipmentValues } from '../equipment.ts'
import type { StatValues } from '../useCombatantStats.ts'

interface CombatantStatsPanelProps {
  title: string
  stats: StatValues
  powerLevel: number
  gold: number
  equipment?: EquipmentValues
}

export default function CombatantStatsPanel({
  title,
  stats,
  powerLevel,
  gold,
  equipment,
}: CombatantStatsPanelProps) {
  return (
    <div className="flex w-full max-w-lg flex-col">
      <h2 className="pb-3 text-center text-lg font-semibold">{title}</h2>

      <div className="flex justify-center gap-8 pb-4">
        <div className="text-center">
          <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Power Level
          </div>
          <div className="text-5xl font-bold tabular-nums">{powerLevel}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Gold
          </div>
          <div className="text-5xl font-bold tabular-nums">{gold}</div>
        </div>
      </div>

      <div className="border-y py-3">
        <div className="mb-2 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Combat Stats
        </div>
        <table className="w-full text-sm">
          <tbody>
            {COMBAT_STATS.map((stat) => (
              <tr key={stat.key} className="border-b last:border-b-0">
                <td className="py-1 font-semibold">{stat.label}</td>
                <td className="py-1 text-right tabular-nums">
                  {getCombatStat(stat.key, stats, equipment).toFixed(stat.decimals ?? 0)}
                  {stat.unit ?? ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

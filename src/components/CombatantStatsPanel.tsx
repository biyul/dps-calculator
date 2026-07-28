import { COMBAT_STATS, getCombatStatBreakdown } from '../combatStats.ts'
import type { InventoryItem } from '../equipment.ts'
import type { StatValues } from '../useCombatantStats.ts'

interface CombatantStatsPanelProps {
  title: string
  stats: StatValues
  powerLevel: number
  gold: number
  inventory?: InventoryItem[]
}

function formatValue(value: number, decimals: number, unit?: string) {
  return `${value.toFixed(decimals)}${unit ?? ''}`
}

function formatSigned(value: number, decimals: number, unit?: string) {
  return `${value > 0 ? '+' : ''}${formatValue(value, decimals, unit)}`
}

function signedColor(value: number) {
  if (value > 0) return 'text-green-600'
  if (value < 0) return 'text-red-600'
  return 'text-muted-foreground/40'
}

export default function CombatantStatsPanel({
  title,
  stats,
  powerLevel,
  gold,
  inventory,
}: CombatantStatsPanelProps) {
  return (
    <div className="flex w-full max-w-2xl flex-col">
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
          <thead>
            <tr className="text-[10px] text-muted-foreground uppercase">
              <th className="text-left font-semibold">Stat</th>
              <th className="py-1 text-right font-semibold">Base</th>
              <th className="py-1 text-right font-semibold">Core</th>
              <th className="py-1 text-right font-semibold">Equip</th>
              <th className="py-1 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {COMBAT_STATS.map((stat) => {
              const { total, base, core, equip } = getCombatStatBreakdown(stat.key, stats, inventory)
              const decimals = stat.decimals ?? 0
              const isTotalBold = total !== base
              return (
                <tr key={stat.key} className="border-b last:border-b-0">
                  <td className="py-1 font-semibold">{stat.label}</td>
                  <td
                    className={`py-1 text-right tabular-nums ${base === 0 ? 'text-muted-foreground/40' : 'text-muted-foreground'}`}
                  >
                    {formatValue(base, decimals, stat.unit)}
                  </td>
                  <td className={`py-1 text-right tabular-nums ${signedColor(core)}`}>
                    {formatSigned(core, decimals, stat.unit)}
                  </td>
                  <td className={`py-1 text-right tabular-nums ${signedColor(equip)}`}>
                    {formatSigned(equip, decimals, stat.unit)}
                  </td>
                  <td className={`py-1 text-right tabular-nums ${isTotalBold ? 'font-bold' : ''}`}>
                    {formatValue(total, decimals, stat.unit)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { CORE_STATS } from '../stats.ts'
import { COMBAT_STATS, getCombatStat } from '../combatStats.ts'
import { getFoePreviewStats, type FoePreset } from '../foes.ts'
import { Button } from '@/components/ui/button'

interface FoeCardProps {
  preset: FoePreset
  onFight: () => void
}

export default function FoeCard({ preset, onFight }: FoeCardProps) {
  const stats = getFoePreviewStats(preset)

  return (
    <div className="flex w-full max-w-sm flex-col rounded-lg border p-4">
      <h3 className="pb-3 text-center text-lg font-semibold">{preset.name}</h3>

      <div className="mb-2 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Core Stats
      </div>
      <table className="mb-4 w-full text-sm">
        <tbody>
          {CORE_STATS.map((stat) => (
            <tr key={stat.key} className="border-b last:border-b-0">
              <td className="py-1 font-semibold">{stat.label}</td>
              <td className="py-1 text-right tabular-nums">{stats[stat.key]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-2 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Combat Stats
      </div>
      <table className="mb-4 w-full text-sm">
        <tbody>
          {COMBAT_STATS.map((stat) => (
            <tr key={stat.key} className="border-b last:border-b-0">
              <td className="py-1 font-semibold">{stat.label}</td>
              <td className="py-1 text-right tabular-nums">
                {getCombatStat(stat.key, stats).toFixed(stat.decimals ?? 0)}
                {stat.unit ?? ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-2 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Rewards
      </div>
      <table className="mb-4 w-full text-sm">
        <tbody>
          <tr className="border-b last:border-b-0">
            <td className="py-1 font-semibold">XP</td>
            <td className="py-1 text-right tabular-nums">{preset.xpReward}</td>
          </tr>
          <tr className="border-b last:border-b-0">
            <td className="py-1 font-semibold">Gold</td>
            <td className="py-1 text-right tabular-nums">{preset.goldReward}</td>
          </tr>
        </tbody>
      </table>

      <Button type="button" onClick={onFight} className="mt-auto">
        FIGHT
      </Button>
    </div>
  )
}

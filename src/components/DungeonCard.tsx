import type { Dungeon } from '../dungeons.ts'
import { Button } from '@/components/ui/button'

interface DungeonCardProps {
  dungeon: Dungeon
  onStart: () => void
  disabled?: boolean
}

export default function DungeonCard({ dungeon, onStart, disabled }: DungeonCardProps) {
  const treasureCount = dungeon.stages.filter((stage) => stage.type === 'treasure').length

  return (
    <div className="flex w-full max-w-sm flex-col rounded-lg border p-4">
      <h3 className="pb-3 text-center text-lg font-semibold">{dungeon.name}</h3>

      <table className="mb-4 w-full text-sm">
        <tbody>
          <tr className="border-b last:border-b-0">
            <td className="py-1 font-semibold">Level</td>
            <td className="py-1 text-right tabular-nums">{dungeon.level}</td>
          </tr>
          <tr className="border-b last:border-b-0">
            <td className="py-1 font-semibold">Stages</td>
            <td className="py-1 text-right tabular-nums">{dungeon.stages.length}</td>
          </tr>
        </tbody>
      </table>

      <div className="mb-2 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Rewards
      </div>
      <table className="mb-4 w-full text-sm">
        <tbody>
          {treasureCount > 0 && (
            <tr className="border-b last:border-b-0">
              <td className="py-1 font-semibold">Treasure</td>
              <td className="py-1 text-right tabular-nums">{treasureCount}</td>
            </tr>
          )}
          <tr className="border-b last:border-b-0">
            <td className="py-1 font-semibold">XP</td>
            <td className="py-1 text-right tabular-nums">{dungeon.reward.xp}</td>
          </tr>
          <tr className="border-b last:border-b-0">
            <td className="py-1 font-semibold">Gold</td>
            <td className="py-1 text-right tabular-nums">{dungeon.reward.gold}</td>
          </tr>
        </tbody>
      </table>

      <Button type="button" onClick={onStart} disabled={disabled} className="mt-auto">
        Start
      </Button>
    </div>
  )
}

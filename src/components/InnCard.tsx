import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface InnCardProps {
  onRest: () => void
  restDisabled?: boolean
  onToggleLevelUp: () => void
  levelUpActive?: boolean
}

export default function InnCard({ onRest, restDisabled, onToggleLevelUp, levelUpActive }: InnCardProps) {
  return (
    <Card className="w-64 items-center gap-3 text-center">
      <h3 className="text-lg font-semibold">Inn</h3>
      <p className="text-sm text-muted-foreground">Rest here to fully recover your HP.</p>
      <Button type="button" onClick={onRest} disabled={restDisabled} className="w-full">
        Rest
      </Button>
      <Button
        type="button"
        variant={levelUpActive ? 'default' : 'outline'}
        onClick={onToggleLevelUp}
        className="w-full"
      >
        Level Up
      </Button>
    </Card>
  )
}

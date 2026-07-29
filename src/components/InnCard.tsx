import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface InnCardProps {
  onRest: () => void
  disabled?: boolean
}

export default function InnCard({ onRest, disabled }: InnCardProps) {
  return (
    <Card className="w-64 items-center gap-3 text-center">
      <h3 className="text-lg font-semibold">Inn</h3>
      <p className="text-sm text-muted-foreground">Rest here to fully recover your HP.</p>
      <Button type="button" onClick={onRest} disabled={disabled} className="w-full">
        Rest
      </Button>
    </Card>
  )
}

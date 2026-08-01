import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface TownBuildingCardProps {
  name: string
  locked?: boolean
  description?: string
  children?: ReactNode
}

export default function TownBuildingCard({
  name,
  locked = true,
  description,
  children,
}: TownBuildingCardProps) {
  return (
    <Card className="w-64 items-center gap-3 text-center">
      <h3 className="text-lg font-semibold">{name}</h3>
      {locked && (
        <div className="flex items-center gap-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <Lock className="size-3" />
          Locked
        </div>
      )}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {locked ? (
        <Button type="button" onClick={() => {}} className="w-full">
          Build
        </Button>
      ) : (
        children
      )}
    </Card>
  )
}

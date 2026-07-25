import { useEffect, useRef } from 'react'
import EventGroupContent from './EventGroupContent.tsx'
import type { AttackEvent, RegenEvent } from '../simulator.ts'
import { cn } from '@/lib/utils'

interface EventLogProps {
  groups: (AttackEvent | RegenEvent)[][]
  className?: string
}

export default function EventLog({ groups, className }: EventLogProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [groups.length])

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex max-h-[50vh] flex-col divide-y overflow-y-auto font-mono text-sm whitespace-nowrap',
        className,
      )}
    >
      {groups.map((group, index) => (
        <div key={index} className="py-1.5 first:pt-0 last:pb-0">
          <EventGroupContent group={group} />
        </div>
      ))}
    </div>
  )
}

import { useEffect, useRef } from 'react'
import EventGroupContent from './EventGroupContent.tsx'
import { eventOrder } from '../eventOrder.ts'
import type { AttackEvent, RegenEvent } from '../simulator.ts'

interface EventColumnsProps {
  groups: (AttackEvent | RegenEvent)[][]
}

export default function EventColumns({ groups }: EventColumnsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [groups.length])

  return (
    <div>
      <div className="mb-1 grid grid-cols-3 gap-3 text-center text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        <div>Player</div>
        <div>Other</div>
        <div>Foe</div>
      </div>
      <div
        ref={containerRef}
        className="flex max-h-[80vh] flex-col divide-y overflow-y-auto font-mono text-sm whitespace-nowrap"
      >
        {groups.map((group, index) => {
          const order = eventOrder(group[0])
          return (
            <div key={index} className="grid grid-cols-3 gap-3 py-1.5 first:pt-0 last:pb-0">
              <div>{order === 0 && <EventGroupContent group={group} />}</div>
              <div>{order === 2 && <EventGroupContent group={group} />}</div>
              <div>{order === 1 && <EventGroupContent group={group} />}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

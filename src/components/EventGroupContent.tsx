import { hpBar } from '../hpBar.ts'
import { mpBar } from '../mpBar.ts'
import type { AttackEvent, RegenEvent } from '../simulator.ts'

interface EventGroupContentProps {
  group: (AttackEvent | RegenEvent)[]
}

export default function EventGroupContent({ group }: EventGroupContentProps) {
  if (group[0].kind === 'regen') {
    return (
      <div className="flex flex-col">
        <span className="text-muted-foreground">t={group[0].time.toFixed(2)}s</span>
        <span>(Regen)</span>
        {group.map((event, index) => {
          if (event.kind !== 'regen') return null
          const percent =
            event.hpAfter !== undefined && event.maxHp !== undefined
              ? Math.round((event.hpAfter / event.maxHp) * 100)
              : undefined
          return (
            <div key={index} className="flex flex-col">
              {event.healAmount !== undefined && (
                <span>
                  {event.label}
                  {' ← '}
                  <span className="font-bold text-green-600">+{event.healAmount}</span>
                  {' '}
                  <span className="text-neutral-500">{hpBar(percent ?? 0)}</span>
                  {' '}
                  <span className="text-neutral-500">{event.hpAfter}</span>
                </span>
              )}
              {event.mpAmount !== undefined && (
                <span>
                  {event.label}
                  {' ← '}
                  <span className="font-bold text-sky-400">+{event.mpAmount}</span>
                  {' '}
                  <span className="text-neutral-500">{mpBar(event.mpAfter ?? 0)}</span>
                  {' '}
                  <span className="text-neutral-500">{event.mpAfter}</span>
                </span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {group.map((event, index) => {
        if (event.kind === 'regen') return null

        if (event.isBlocked) {
          return (
            <div key={index} className="flex flex-col">
              <span className="text-muted-foreground">t={event.time.toFixed(2)}s</span>
              <span>
                {event.attackerLabel}
                {': '}
                <span className="font-bold text-black dark:text-neutral-300">
                  {event.abilityLabel ?? 'Attack'}
                </span>
                {'!'}
                {event.isCrit && (
                  <>
                    {' '}
                    <span className="font-bold text-orange-500">CRIT!</span>
                  </>
                )}
              </span>
              <span>
                {event.targetLabel}
                {': '}
                <span className="text-blue-500">BLOCK!</span>
              </span>
            </div>
          )
        }

        const percent = Math.round((event.targetHpAfter / event.targetMaxHp) * 100)
        return (
          <div key={index} className="flex flex-col">
            <span className="text-muted-foreground">t={event.time.toFixed(2)}s</span>
            <span>
              {event.attackerLabel}
              {': '}
              <span className="font-bold dark:text-neutral-300">{event.abilityLabel ?? 'Attack'}</span>
              {'!'}
              {event.isCrit && (
                <>
                  {' '}
                  <span className="font-bold text-orange-500">CRIT!</span>
                </>
              )}
            </span>
            <span>
              {event.targetLabel}
              {' ← '}
              <span className={`font-bold ${event.abilityLabel ? 'text-purple-500' : 'text-yellow-600'}`}>
                -{event.damage}
              </span>
              {' '}
              <span className="text-neutral-500">{hpBar(percent)}</span>
              {' '}
              <span className="text-neutral-500">{event.targetHpAfter}</span>
            </span>
            {event.lifesteal && (
              <span>
                {event.attackerLabel}
                {' ← '}
                <span className="font-bold text-green-600">+{event.lifesteal.healAmount}</span>
                {' '}
                <span className="text-neutral-500">
                  {hpBar(
                    Math.round((event.lifesteal.attackerHpAfter / event.lifesteal.attackerMaxHp) * 100),
                  )}
                </span>
                {' '}
                <span className="text-neutral-500">{event.lifesteal.attackerHpAfter}</span>
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

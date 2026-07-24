import { useEffect, useMemo, useRef, useState } from 'react'
import { RotateCw } from 'lucide-react'
import { getBaseStat } from './baseStats.ts'
import { getCombatStat } from './combatStats.ts'
import { buildTimeline, REGEN_INTERVAL_SEC, type AttackEvent, type RegenEvent } from './simulator.ts'
import { hpBar } from './hpBar.ts'
import { mpBar } from './mpBar.ts'
import { useCombatantStats } from './useCombatantStats.ts'
import CombatantPanel from './components/CombatantPanel.tsx'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

function eventOrder(event: AttackEvent | RegenEvent): number {
  if (event.kind === 'attack') return event.attackerLabel === 'Player' ? 0 : 1
  return 2
}

function App() {
  const player = useCombatantStats()
  const foe = useCombatantStats()
  const [rerunCount, setRerunCount] = useState(0)
  const [animateLog, setAnimateLog] = useState(false)
  const [visibleGroupCount, setVisibleGroupCount] = useState(0)

  const timeline = useMemo(
    () =>
      buildTimeline([
        {
          label: 'Player',
          baseAttackSpeed: getBaseStat('attackSpeed'),
          attackSpeedPercent: player.stats.attackSpeed,
          attackDamage: getCombatStat('attack', player.stats),
          hp: getCombatStat('hp', player.stats),
          critChance: getCombatStat('critChance', player.stats),
          critDamageMultiplier: getCombatStat('critDamage', player.stats),
          blockChance: getCombatStat('block', player.stats),
          healthRegPercent: getCombatStat('healthReg', player.stats),
          lifestealPercent: getCombatStat('lifesteal', player.stats),
          mpRegen: getCombatStat('mpRegen', player.stats),
          mp: getCombatStat('mp', player.stats),
          intelligence: player.stats.intelligence,
          abilities: player.abilities,
          abilityOrder: player.abilityOrder,
        },
        {
          label: 'Foe',
          baseAttackSpeed: getBaseStat('attackSpeed'),
          attackSpeedPercent: foe.stats.attackSpeed,
          attackDamage: getCombatStat('attack', foe.stats),
          hp: getCombatStat('hp', foe.stats),
          critChance: getCombatStat('critChance', foe.stats),
          critDamageMultiplier: getCombatStat('critDamage', foe.stats),
          blockChance: getCombatStat('block', foe.stats),
          healthRegPercent: getCombatStat('healthReg', foe.stats),
          lifestealPercent: getCombatStat('lifesteal', foe.stats),
          mpRegen: getCombatStat('mpRegen', foe.stats),
          mp: getCombatStat('mp', foe.stats),
          intelligence: foe.stats.intelligence,
          abilities: foe.abilities,
          abilityOrder: foe.abilityOrder,
        },
      ]),
    [
      player.stats.attackSpeed,
      player.stats.strength,
      player.stats.dexterity,
      player.stats.intelligence,
      player.stats.critChance,
      player.stats.critDamage,
      player.stats.block,
      player.stats.healthReg,
      player.stats.lifesteal,
      player.abilities,
      player.abilityOrder,
      foe.stats.attackSpeed,
      foe.stats.strength,
      foe.stats.dexterity,
      foe.stats.intelligence,
      foe.stats.critChance,
      foe.stats.critDamage,
      foe.stats.block,
      foe.stats.healthReg,
      foe.stats.lifesteal,
      foe.abilities,
      foe.abilityOrder,
      rerunCount,
    ],
  )

  const logEvents = timeline.filter(
    (e): e is AttackEvent | RegenEvent => e.kind === 'attack' || e.kind === 'regen',
  )
  const victoryEvent = timeline.find((e) => e.kind === 'victory')

  const sortedLogEvents = [...logEvents].sort((a, b) => {
    const bucketA = Math.ceil(a.time / REGEN_INTERVAL_SEC)
    const bucketB = Math.ceil(b.time / REGEN_INTERVAL_SEC)
    if (bucketA !== bucketB) return bucketA - bucketB
    return eventOrder(a) - eventOrder(b)
  })

  const eventGroups: (AttackEvent | RegenEvent)[][] = []
  for (const event of sortedLogEvents) {
    const bucket = Math.ceil(event.time / REGEN_INTERVAL_SEC)
    const order = eventOrder(event)
    const lastGroup = eventGroups[eventGroups.length - 1]
    const lastEvent = lastGroup?.[lastGroup.length - 1]
    const sameGroup =
      lastEvent &&
      Math.ceil(lastEvent.time / REGEN_INTERVAL_SEC) === bucket &&
      eventOrder(lastEvent) === order
    if (sameGroup) {
      lastGroup.push(event)
    } else {
      eventGroups.push([event])
    }
  }

  useEffect(() => {
    setVisibleGroupCount(animateLog ? 0 : eventGroups.length)
    if (!animateLog) return

    const id = setInterval(() => {
      setVisibleGroupCount((n) => Math.min(n + 1, eventGroups.length))
    }, 500)

    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateLog, timeline])

  const displayedGroups = animateLog ? eventGroups.slice(0, visibleGroupCount) : eventGroups
  const visibleVictoryEvent =
    animateLog && victoryEvent
      ? visibleGroupCount >= eventGroups.length
        ? victoryEvent
        : undefined
      : victoryEvent

  const logContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = logContainerRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [displayedGroups.length, visibleVictoryEvent])

  return (
    <div className="px-4 pb-6">
      <h1 className="py-5 text-center text-2xl font-medium tracking-tight">
        DPS Calculator
      </h1>

      <div className="mx-auto flex max-w-375 flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center">
        <CombatantPanel
          title="Player"
          stats={player.stats}
          powerLevel={player.powerLevel}
          onUpdateStat={player.updateStat}
          onSetAll={player.setAllStats}
          abilities={player.abilities}
          onToggleAbility={player.toggleAbility}
          abilityOrder={player.abilityOrder}
          onReorderAbilities={player.reorderAbilities}
        />

        <CombatantPanel
          title="Foe"
          stats={foe.stats}
          powerLevel={foe.powerLevel}
          onUpdateStat={foe.updateStat}
          onSetAll={foe.setAllStats}
          abilities={foe.abilities}
          onToggleAbility={foe.toggleAbility}
          abilityOrder={foe.abilityOrder}
          onReorderAbilities={foe.reorderAbilities}
        />

        <div className="w-full max-w-md shrink-0 lg:w-88">
          <div className="mb-2 flex items-center justify-center gap-3">
            <div className="text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Simulation
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              aria-label="Rerun simulation"
              onClick={() => setRerunCount((n) => n + 1)}
            >
              <RotateCw />
            </Button>
            <div className="flex items-center gap-1.5">
              <Label htmlFor="animate-log" className="text-xs text-muted-foreground">
                Animate
              </Label>
              <Switch id="animate-log" checked={animateLog} onCheckedChange={setAnimateLog} />
            </div>
          </div>
          <div
            ref={logContainerRef}
            className="flex max-h-[80vh] flex-col divide-y overflow-y-auto font-mono text-sm whitespace-nowrap"
          >
            {displayedGroups.map((group, groupIndex) => {
              if (group[0].kind === 'regen') {
                return (
                  <div key={groupIndex} className="flex flex-col py-1.5 first:pt-0 last:pb-0">
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
                <div key={groupIndex} className="flex flex-col gap-3 py-1.5 first:pt-0 last:pb-0">
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
                        <span className="font-bold dark:text-neutral-300">
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
                        {' ← '}
                        <span
                          className={`font-bold ${event.abilityLabel ? 'text-purple-500' : 'text-yellow-600'}`}
                        >
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
                          <span className="font-bold text-green-600">
                            +{event.lifesteal.healAmount}
                          </span>
                          {' '}
                          <span className="text-neutral-500">
                            {hpBar(
                              Math.round(
                                (event.lifesteal.attackerHpAfter / event.lifesteal.attackerMaxHp) * 100,
                              ),
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
            })}
          </div>

          {visibleVictoryEvent && (
            <div className="mt-3 flex flex-col font-mono text-sm whitespace-nowrap">
              <span className="text-muted-foreground">t={visibleVictoryEvent.time.toFixed(2)}s</span>
              <span>
                <span className="font-bold">{visibleVictoryEvent.winnerLabel}</span> wins!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
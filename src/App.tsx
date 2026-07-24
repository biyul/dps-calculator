import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, RotateCw } from 'lucide-react'
import { getBaseStat } from './baseStats.ts'
import { getCombatStat } from './combatStats.ts'
import { getEquipmentTotal, type EquipmentValues } from './equipment.ts'
import { FOE_PRESETS, type FoePreset } from './foes.ts'
import {
  buildTimeline,
  REGEN_INTERVAL_SEC,
  type AttackEvent,
  type CombatantInput,
  type RegenEvent,
  type TimelineEvent,
} from './simulator.ts'
import { hpBar } from './hpBar.ts'
import { mpBar } from './mpBar.ts'
import { useCombatantStats, type AbilityValues, type StatValues } from './useCombatantStats.ts'
import CombatantStatsPanel from './components/CombatantStatsPanel.tsx'
import CombatantCorePanel from './components/CombatantCorePanel.tsx'
import CombatantAbilitiesPanel from './components/CombatantAbilitiesPanel.tsx'
import CombatantEquipmentPanel from './components/CombatantEquipmentPanel.tsx'
import FoeCard from './components/FoeCard.tsx'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

function eventOrder(event: AttackEvent | RegenEvent): number {
  if (event.kind === 'attack') return event.attackerLabel === 'Player' ? 0 : 1
  return 2
}

function buildCombatantInput(
  label: string,
  stats: StatValues,
  equipment: EquipmentValues,
  abilities: AbilityValues,
  abilityOrder: string[],
): CombatantInput {
  return {
    label,
    baseSpeed: getBaseStat('speed'),
    speedPercent: stats.speed + getEquipmentTotal(equipment, 'speed'),
    attackDamage: getCombatStat('attack', stats),
    hp: getCombatStat('hp', stats, equipment),
    critChance: getCombatStat('critChance', stats),
    critDamageMultiplier: getCombatStat('critDamage', stats),
    blockChance: getCombatStat('block', stats),
    healthRegPercent: getCombatStat('healthReg', stats),
    lifestealPercent: getCombatStat('lifesteal', stats),
    mpRegen: getCombatStat('mpRegen', stats),
    mp: getCombatStat('mp', stats, equipment),
    intelligence: stats.intelligence,
    abilities,
    abilityOrder,
  }
}

type Screen = 'fight' | 'stats' | 'core' | 'abilities' | 'equipment'

const NAV_ITEMS: { key: Screen; label: string }[] = [
  { key: 'fight', label: 'Fight' },
  { key: 'stats', label: 'Stats' },
  { key: 'core', label: 'Core' },
  { key: 'abilities', label: 'Abilities' },
  { key: 'equipment', label: 'Equipment' },
]

function App() {
  const player = useCombatantStats({ coreStatsBase: 10 })
  const foe = useCombatantStats()
  const [screen, setScreen] = useState<Screen>('fight')
  const [selectedFoeKey, setSelectedFoeKey] = useState<string | null>(null)
  const [animateLog, setAnimateLog] = useState(false)
  const [visibleGroupCount, setVisibleGroupCount] = useState(0)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])

  function runSimulation(foeStats: StatValues = foe.stats) {
    setTimeline(
      buildTimeline([
        buildCombatantInput('Player', player.stats, player.equipment, player.abilities, player.abilityOrder),
        buildCombatantInput('Foe', foeStats, foe.equipment, foe.abilities, foe.abilityOrder),
      ]),
    )
  }

  function handleFight(preset: FoePreset) {
    const newFoeStats: StatValues = {
      ...foe.stats,
      strength: preset.strength,
      dexterity: preset.dexterity,
      intelligence: preset.intelligence,
    }
    foe.setStatsBulk({
      strength: preset.strength,
      dexterity: preset.dexterity,
      intelligence: preset.intelligence,
    })
    setSelectedFoeKey(preset.key)
    runSimulation(newFoeStats)
  }

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
    }, 1000)

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

      <nav className="mb-8 flex justify-center gap-2">
        {NAV_ITEMS.map((item) => (
          <Button
            key={item.key}
            type="button"
            variant={screen === item.key ? 'default' : 'outline'}
            onClick={() => setScreen(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </nav>

      {screen === 'fight' && !selectedFoeKey && (
        <div className="mx-auto flex max-w-375 flex-wrap items-stretch justify-center gap-6">
          {FOE_PRESETS.map((preset) => (
            <FoeCard key={preset.key} preset={preset} onFight={() => handleFight(preset)} />
          ))}
        </div>
      )}

      {screen === 'fight' && selectedFoeKey && (
        <div className="mx-auto w-full max-w-md">
          <div className="mb-2 flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              aria-label="Back to foe list"
              onClick={() => setSelectedFoeKey(null)}
            >
              <ArrowLeft />
            </Button>
            <div className="text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Simulation
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              aria-label="Rerun simulation"
              onClick={() => runSimulation()}
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
      )}

      {screen === 'stats' && (
        <div className="mx-auto flex max-w-375 flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center">
          <CombatantStatsPanel
            title="Player"
            stats={player.stats}
            powerLevel={player.powerLevel}
            equipment={player.equipment}
          />
        </div>
      )}

      {screen === 'core' && (
        <div className="mx-auto flex max-w-375 flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center">
          <CombatantCorePanel
            title="Player"
            stats={player.stats}
            onUpdateStat={player.updateStat}
            onSetAll={player.setAllStats}
          />
        </div>
      )}

      {screen === 'abilities' && (
        <div className="mx-auto flex max-w-375 flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center">
          <CombatantAbilitiesPanel
            title="Player"
            abilities={player.abilities}
            onToggleAbility={player.toggleAbility}
            abilityOrder={player.abilityOrder}
            onReorderAbilities={player.reorderAbilities}
          />
        </div>
      )}

      {screen === 'equipment' && (
        <div className="mx-auto flex max-w-375 flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center">
          <CombatantEquipmentPanel
            title="Player"
            stats={player.stats}
            onUpdateStat={player.updateStat}
            onSetAll={player.setAllStats}
            equipment={player.equipment}
            onToggleEquipment={player.toggleEquipment}
          />
        </div>
      )}
    </div>
  )
}

export default App

import { useEffect, useState } from 'react'
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
import { useCombatantStats, type AbilityValues, type StatValues } from './useCombatantStats.ts'
import { useMetaStats, META_STATS } from './useMetaStats.ts'
import { eventOrder } from './eventOrder.ts'
import CombatantStatsPanel from './components/CombatantStatsPanel.tsx'
import CombatantCorePanel from './components/CombatantCorePanel.tsx'
import CombatantAbilitiesPanel from './components/CombatantAbilitiesPanel.tsx'
import CombatantEquipmentPanel from './components/CombatantEquipmentPanel.tsx'
import FoeCard from './components/FoeCard.tsx'
import EventLog from './components/EventLog.tsx'
import EventColumns from './components/EventColumns.tsx'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup } from '@/components/ui/toggle-group'

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
type LogView = 'log' | 'columns'

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
  const { metaStats, setMetaStats } = useMetaStats()
  const [screen, setScreen] = useState<Screen>('fight')
  const [selectedFoeKey, setSelectedFoeKey] = useState<string | null>(null)
  const [animateLog, setAnimateLog] = useState(false)
  const [logView, setLogView] = useState<LogView>('log')
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

  useEffect(() => {
    if (!victoryEvent || !selectedFoeKey) return
    const preset = FOE_PRESETS.find((p) => p.key === selectedFoeKey)
    if (!preset) return
    const multiplier = victoryEvent.winnerLabel === 'Player' ? 1 : 0.1
    setMetaStats((prev) => ({
      ...prev,
      xp: prev.xp + Math.round(preset.xpReward * multiplier),
      gold: prev.gold + Math.round(preset.goldReward * multiplier),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeline])

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

  return (
    <div className="px-4 pb-6">
      <div className="relative py-5">
        <h1 className="text-center text-2xl font-medium tracking-tight">
          DPS Calculator
        </h1>

        <div className="absolute top-1/2 right-0 flex -translate-y-1/2 gap-4">
          {META_STATS.map((stat) => (
            <div key={stat.key} className="text-center">
              <div className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                {stat.label}
              </div>
              <div className="text-lg font-bold tabular-nums">{metaStats[stat.key]}</div>
            </div>
          ))}
        </div>
      </div>

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
        <div className={`mx-auto w-full ${logView === 'columns' ? 'max-w-4xl' : 'max-w-md'}`}>
          <div className="mb-2 flex flex-wrap items-center justify-center gap-3">
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
            <ToggleGroup
              value={[logView]}
              onValueChange={(values) => {
                const next = values[0]
                if (next) setLogView(next as LogView)
              }}
            >
              <Toggle value="log" aria-label="Single log view">
                Log
              </Toggle>
              <Toggle value="columns" aria-label="Three column view">
                Columns
              </Toggle>
            </ToggleGroup>
          </div>

          {logView === 'log' ? (
            <EventLog groups={displayedGroups} />
          ) : (
            <EventColumns groups={displayedGroups} />
          )}

          {visibleVictoryEvent && (
            <div className="mt-3 flex flex-col font-mono text-sm whitespace-nowrap">
              <span className="text-muted-foreground">t={visibleVictoryEvent.time.toFixed(2)}s</span>
              <span>
                <span className="font-bold">{visibleVictoryEvent.winnerLabel}</span> wins!
              </span>
            </div>
          )}

          <div className="mt-4 flex justify-center gap-2">
            <Button type="button" onClick={() => runSimulation()}>
              Fight Again
            </Button>
            <Button type="button" variant="outline" onClick={() => setSelectedFoeKey(null)}>
              Go Back to Listings
            </Button>
          </div>
        </div>
      )}

      {screen === 'stats' && (
        <div className="mx-auto flex max-w-375 flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center">
          <CombatantStatsPanel
            title="Player"
            stats={player.stats}
            powerLevel={player.powerLevel}
            gold={player.gold}
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

import { useEffect, useState } from 'react'
import { ArrowLeft, RotateCw } from 'lucide-react'
import { getBaseStat } from './baseStats.ts'
import { getCombatStat } from './combatStats.ts'
import { getEquipmentPiece, getEquipmentTotal, type InventoryItem } from './equipment.ts'
import { FOE_PRESETS, type FoePreset } from './foes.ts'
import {
  buildTimeline,
  getFinalHp,
  REGEN_INTERVAL_SEC,
  type AttackEvent,
  type CombatantInput,
  type RegenEvent,
  type TimelineEvent,
} from './simulator.ts'
import { useCombatantStats, type AbilityValues, type StatValues } from './useCombatantStats.ts'
import { useMetaStats, META_STATS } from './useMetaStats.ts'
import { eventOrder } from './eventOrder.ts'
import { totalLevelUpCost } from './levelUpCost.ts'
import CombatantStatsPanel from './components/CombatantStatsPanel.tsx'
import CombatantAbilitiesPanel from './components/CombatantAbilitiesPanel.tsx'
import CombatantEquipmentPanel from './components/CombatantEquipmentPanel.tsx'
import FoeCard from './components/FoeCard.tsx'
import InnCard from './components/InnCard.tsx'
import LevelUpCard from './components/LevelUpCard.tsx'
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
  inventory: InventoryItem[],
  abilities: AbilityValues,
  abilityOrder: string[],
  startingHp?: number,
): CombatantInput {
  return {
    label,
    baseSpeed: getBaseStat('speed'),
    speedPercent: stats.speed + getEquipmentTotal(inventory, 'speed'),
    attackDamage: getCombatStat('attack', stats),
    hp: getCombatStat('hp', stats, inventory),
    critChance: getCombatStat('critChance', stats),
    critDamageMultiplier: getCombatStat('critDamage', stats),
    blockChance: getCombatStat('block', stats),
    healthRegPercent: getCombatStat('healthReg', stats),
    lifestealPercent: getCombatStat('lifesteal', stats),
    mpRegen: getCombatStat('mpRegen', stats),
    mp: getCombatStat('mp', stats, inventory),
    intelligence: stats.intelligence,
    abilities,
    abilityOrder,
    startingHp,
  }
}

type Screen = 'fight' | 'town' | 'stats' | 'abilities' | 'equipment'
type LogView = 'log' | 'columns'

interface FightEarnings {
  xp: number
  gold: number
  item?: InventoryItem
}

const NAV_ITEMS: { key: Screen; label: string }[] = [
  { key: 'fight', label: 'Fight' },
  { key: 'town', label: 'Town' },
  { key: 'stats', label: 'Stats' },
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
  const [earnings, setEarnings] = useState<FightEarnings | null>(null)
  const [playerHp, setPlayerHp] = useState<number | null>(null)
  const [showLevelUp, setShowLevelUp] = useState(false)

  const playerMaxHp = getCombatStat('hp', player.stats, player.inventory)
  const playerCurrentHp = Math.min(playerHp ?? playerMaxHp, playerMaxHp)
  const isPlayerDefeated = playerCurrentHp <= 0

  function runSimulation(foeStats: StatValues = foe.stats) {
    setTimeline(
      buildTimeline([
        buildCombatantInput(
          'Player',
          player.stats,
          player.inventory,
          player.abilities,
          player.abilityOrder,
          playerCurrentHp,
        ),
        buildCombatantInput('Foe', foeStats, foe.inventory, foe.abilities, foe.abilityOrder),
      ]),
    )
  }

  function handleFight(preset: FoePreset) {
    if (isPlayerDefeated) return

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

  function handleRest() {
    setPlayerHp(null)
  }

  function handleLevelUp(pending: Record<string, number>) {
    const totalIncrements = Object.values(pending).reduce((sum, count) => sum + count, 0)
    if (totalIncrements === 0) return

    const cost = totalLevelUpCost(metaStats.level, totalIncrements)
    if (metaStats.xp < cost) return

    setMetaStats((prev) => ({ ...prev, level: prev.level + totalIncrements, xp: prev.xp - cost }))
    for (const [statKey, count] of Object.entries(pending)) {
      if (count > 0) player.updateStat(statKey, player.stats[statKey] + count)
    }
  }

  const logEvents = timeline.filter(
    (e): e is AttackEvent | RegenEvent => e.kind === 'attack' || e.kind === 'regen',
  )
  const victoryEvent = timeline.find((e) => e.kind === 'victory')

  useEffect(() => {
    if (!victoryEvent || !selectedFoeKey) {
      setEarnings(null)
      return
    }

    const finalPlayerHp = getFinalHp(timeline, 'Player')
    if (finalPlayerHp !== undefined) {
      setPlayerHp(Math.max(0, finalPlayerHp))
    }

    const preset = FOE_PRESETS.find((p) => p.key === selectedFoeKey)
    if (!preset) return
    const won = victoryEvent.winnerLabel === 'Player'
    const multiplier = won ? 1 : 0.1
    const xpEarned = Math.round(preset.xpReward * multiplier)
    const goldEarned = Math.round(preset.goldReward * multiplier)

    setMetaStats((prev) => ({
      ...prev,
      xp: prev.xp + xpEarned,
      gold: prev.gold + goldEarned,
    }))

    const itemDropped = won ? player.addRandomEquipment() : undefined

    setEarnings({ xp: xpEarned, gold: goldEarned, item: itemDropped })
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

        <div className="absolute top-1/2 left-0 -translate-y-1/2 text-center">
          <div className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Player HP
          </div>
          <div className={`text-lg font-bold tabular-nums ${isPlayerDefeated ? 'text-red-600' : ''}`}>
            {playerCurrentHp} / {playerMaxHp}
          </div>
        </div>

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
            <FoeCard
              key={preset.key}
              preset={preset}
              onFight={() => handleFight(preset)}
              disabled={isPlayerDefeated}
            />
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
              disabled={isPlayerDefeated}
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

          {visibleVictoryEvent && earnings && (
            <div className="mt-3 flex flex-col items-center gap-1">
              <div className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                Spoils
              </div>
              <div className="flex gap-4 font-mono text-sm">
                <span>
                  <span className="text-muted-foreground">XP </span>
                  <span className="font-bold text-green-600">+{earnings.xp}</span>
                </span>
                <span>
                  <span className="text-muted-foreground">Gold </span>
                  <span className="font-bold text-green-600">+{earnings.gold}</span>
                </span>
              </div>
              {earnings.item &&
                (() => {
                  const droppedPiece = getEquipmentPiece(earnings.item.key)
                  return droppedPiece ? (
                    <div className="font-mono text-sm">
                      <span className="text-muted-foreground">Item </span>
                      <span className="font-bold">
                        {droppedPiece.label} ({droppedPiece.type}, Level {earnings.item.level})
                      </span>
                    </div>
                  ) : null
                })()}
            </div>
          )}

          <div className="mt-4 flex justify-center gap-2">
            <Button type="button" disabled={isPlayerDefeated} onClick={() => runSimulation()}>
              Fight Again
            </Button>
            <Button type="button" variant="outline" onClick={() => setSelectedFoeKey(null)}>
              Go Back to Listings
            </Button>
          </div>
        </div>
      )}

      {screen === 'town' && (
        <div className="mx-auto flex max-w-375 flex-col items-center gap-6">
          <div className="flex flex-wrap items-stretch justify-center gap-6">
            <InnCard
              onRest={handleRest}
              restDisabled={playerCurrentHp >= playerMaxHp}
              onToggleLevelUp={() => setShowLevelUp((v) => !v)}
              levelUpActive={showLevelUp}
            />
          </div>
          {showLevelUp && (
            <LevelUpCard
              stats={player.stats}
              level={metaStats.level}
              xp={metaStats.xp}
              onConfirm={handleLevelUp}
            />
          )}
        </div>
      )}

      {screen === 'stats' && (
        <div className="mx-auto flex max-w-375 flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center">
          <CombatantStatsPanel
            title="Player"
            stats={player.stats}
            powerLevel={player.powerLevel}
            inventory={player.inventory}
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
            inventory={player.inventory}
            onAddEquipment={player.addRandomEquipment}
            onSellEquipment={player.sellEquipment}
            onSellAllEquipment={player.sellAllEquipment}
            onToggleEquip={player.toggleEquip}
          />
        </div>
      )}
    </div>
  )
}

export default App

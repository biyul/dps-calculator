import { useMemo, useState } from 'react'
import { RotateCw } from 'lucide-react'
import { getBaseStat } from './baseStats.ts'
import { getCombatStat } from './combatStats.ts'
import { buildTimeline, type AttackEvent, type RegenEvent } from './simulator.ts'
import { hpBar } from './hpBar.ts'
import { useCombatantStats } from './useCombatantStats.ts'
import CombatantPanel from './components/CombatantPanel.tsx'
import { Button } from '@/components/ui/button'

function App() {
  const player = useCombatantStats()
  const foe = useCombatantStats()
  const [rerunCount, setRerunCount] = useState(0)

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
      rerunCount,
    ],
  )

  const logEvents = timeline.filter(
    (e): e is AttackEvent | RegenEvent => e.kind === 'attack' || e.kind === 'regen',
  )
  const victoryEvent = timeline.find((e) => e.kind === 'victory')

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
        />

        <CombatantPanel
          title="Foe"
          stats={foe.stats}
          powerLevel={foe.powerLevel}
          onUpdateStat={foe.updateStat}
          onSetAll={foe.setAllStats}
          abilities={foe.abilities}
          onToggleAbility={foe.toggleAbility}
        />

        <div className="w-full max-w-md shrink-0 lg:w-88">
          <div className="mb-2 flex items-center justify-center gap-2">
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
          </div>
          <div className="flex max-h-[80vh] flex-col gap-3 overflow-y-auto font-mono text-sm whitespace-nowrap">
            {logEvents.map((event, index) => {
              if (event.kind === 'regen') {
                const percent =
                  event.hpAfter !== undefined && event.maxHp !== undefined
                    ? Math.round((event.hpAfter / event.maxHp) * 100)
                    : undefined
                return (
                  <div key={index} className="flex flex-col">
                    <span className="text-muted-foreground">t={event.time.toFixed(2)}s</span>
                    <span>
                      {event.label}
                      {': Regen'}
                    </span>
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
                        <span className="text-neutral-500">{event.mpAfter}</span>
                      </span>
                    )}
                  </div>
                )
              }

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
                        {hpBar(Math.round((event.lifesteal.attackerHpAfter / event.lifesteal.attackerMaxHp) * 100))}
                      </span>
                      {' '}
                      <span className="text-neutral-500">{event.lifesteal.attackerHpAfter}</span>
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {victoryEvent && (
            <div className="mt-3 flex flex-col font-mono text-sm whitespace-nowrap">
              <span className="text-muted-foreground">t={victoryEvent.time.toFixed(2)}s</span>
              <span>
                <span className="font-bold">{victoryEvent.winnerLabel}</span> wins!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
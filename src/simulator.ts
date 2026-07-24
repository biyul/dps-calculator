import { ABILITIES, type Ability } from './abilities.ts'
import type { AbilityValues } from './useCombatantStats.ts'

export interface LifestealHeal {
  healAmount: number
  attackerHpAfter: number
  attackerMaxHp: number
}

export interface AttackEvent {
  kind: 'attack'
  time: number
  attackerLabel: string
  targetLabel: string
  damage: number
  isCrit: boolean
  isBlocked: boolean
  targetHpAfter: number
  targetMaxHp: number
  lifesteal?: LifestealHeal
  abilityLabel?: string
}

export interface RegenEvent {
  kind: 'regen'
  time: number
  label: string
  healAmount?: number
  hpAfter?: number
  maxHp?: number
  mpAmount?: number
  mpAfter?: number
}

export interface VictoryEvent {
  kind: 'victory'
  time: number
  winnerLabel: string
}

export type TimelineEvent = AttackEvent | RegenEvent | VictoryEvent

export interface CombatantInput {
  label: string
  baseAttackSpeed: number
  attackSpeedPercent: number
  attackDamage: number
  hp: number
  critChance: number
  critDamageMultiplier: number
  blockChance: number
  healthRegPercent: number
  lifestealPercent: number
  mpRegen: number
  mp: number
  intelligence: number
  abilities: AbilityValues
  abilityOrder: string[]
}

interface RawAttack {
  kind: 'attack'
  time: number
  attackerLabel: string
  targetLabel: string
}

interface RawRegen {
  kind: 'regen'
  time: number
  label: string
  healAmount?: number
  mpAmount?: number
}

type RawEvent = RawAttack | RawRegen

const TIMELINE_DURATION_SEC = 15
export const REGEN_INTERVAL_SEC = 1
const EPSILON = 1e-9

function buildCombatantAttackSlots(attacker: CombatantInput, target: CombatantInput): RawAttack[] {
  const effectiveAttackSpeed = attacker.baseAttackSpeed * (1 + attacker.attackSpeedPercent / 100)
  const interval = 1 / effectiveAttackSpeed
  const attacks: RawAttack[] = []

  for (let t = interval; t <= TIMELINE_DURATION_SEC + EPSILON; t += interval) {
    attacks.push({
      kind: 'attack',
      time: Math.round(t * 100) / 100,
      attackerLabel: attacker.label,
      targetLabel: target.label,
    })
  }

  return attacks
}

function pickAbility(
  attacker: CombatantInput,
  mpAvailable: number,
  rotationIndex: number,
): { ability: Ability; nextRotationIndex: number } | undefined {
  const enabledOrder = attacker.abilityOrder.filter((key) => attacker.abilities[key])
  if (enabledOrder.length === 0) return undefined

  for (let i = 0; i < enabledOrder.length; i++) {
    const index = (rotationIndex + i) % enabledOrder.length
    const ability = ABILITIES.find((a) => a.key === enabledOrder[index])
    if (ability && mpAvailable >= (ability.mpCost ?? 0)) {
      return { ability, nextRotationIndex: (index + 1) % enabledOrder.length }
    }
  }

  return undefined
}

function buildCombatantRegenTicks(combatant: CombatantInput): RawRegen[] {
  if (combatant.healthRegPercent <= 0 && combatant.mpRegen <= 0) return []

  const healAmount =
    combatant.healthRegPercent > 0
      ? Math.round(combatant.hp * (combatant.healthRegPercent / 100))
      : undefined
  const mpAmount = combatant.mpRegen > 0 ? Math.round(combatant.mpRegen) : undefined
  const ticks: RawRegen[] = []

  for (let t = REGEN_INTERVAL_SEC; t <= TIMELINE_DURATION_SEC + EPSILON; t += REGEN_INTERVAL_SEC) {
    ticks.push({
      kind: 'regen',
      time: Math.round(t * 100) / 100,
      label: combatant.label,
      healAmount,
      mpAmount,
    })
  }

  return ticks
}

export function buildTimeline(combatants: [CombatantInput, CombatantInput]): TimelineEvent[] {
  const [a, b] = combatants

  const events: RawEvent[] = [
    ...buildCombatantAttackSlots(a, b),
    ...buildCombatantAttackSlots(b, a),
    ...buildCombatantRegenTicks(a),
    ...buildCombatantRegenTicks(b),
  ].sort((x, y) => x.time - y.time)

  const combatantByLabel: Record<string, CombatantInput> = { [a.label]: a, [b.label]: b }
  const maxHp: Record<string, number> = { [a.label]: a.hp, [b.label]: b.hp }
  const currentHp: Record<string, number> = { ...maxHp }
  const currentMp: Record<string, number> = { [a.label]: a.mp, [b.label]: b.mp }
  const abilityRotationIndex: Record<string, number> = { [a.label]: 0, [b.label]: 0 }
  const lifestealByLabel: Record<string, number> = {
    [a.label]: a.lifestealPercent,
    [b.label]: b.lifestealPercent,
  }

  const timeline: TimelineEvent[] = []

  for (const event of events) {
    if (event.kind === 'regen') {
      if (event.healAmount !== undefined) {
        currentHp[event.label] = Math.min(maxHp[event.label], currentHp[event.label] + event.healAmount)
      }
      if (event.mpAmount !== undefined) {
        currentMp[event.label] = currentMp[event.label] + event.mpAmount
      }
      timeline.push({
        kind: 'regen',
        time: event.time,
        label: event.label,
        healAmount: event.healAmount,
        hpAfter: event.healAmount !== undefined ? currentHp[event.label] : undefined,
        maxHp: event.healAmount !== undefined ? maxHp[event.label] : undefined,
        mpAmount: event.mpAmount,
        mpAfter: event.mpAmount !== undefined ? currentMp[event.label] : undefined,
      })
      continue
    }

    const attacker = combatantByLabel[event.attackerLabel]
    const target = combatantByLabel[event.targetLabel]

    const picked = pickAbility(attacker, currentMp[attacker.label], abilityRotationIndex[attacker.label])
    const ability = picked?.ability
    if (picked) {
      currentMp[attacker.label] -= picked.ability.mpCost ?? 0
      abilityRotationIndex[attacker.label] = picked.nextRotationIndex
    }

    const baseDamage = ability
      ? (ability.baseDamage ?? 0) + (ability.intScaling ?? 0) * attacker.intelligence
      : attacker.attackDamage

    const isBlocked = Math.random() * 100 < target.blockChance
    const isCrit = Math.random() * 100 < attacker.critChance
    const damage = isBlocked
      ? 0
      : isCrit
        ? Math.round(baseDamage * (1 + attacker.critDamageMultiplier / 100))
        : Math.round(baseDamage)

    currentHp[event.targetLabel] = Math.max(0, currentHp[event.targetLabel] - damage)

    let lifesteal: LifestealHeal | undefined
    if (!isBlocked) {
      const lifestealPercent = lifestealByLabel[event.attackerLabel]
      const healAmount = Math.round(damage * (lifestealPercent / 100))
      if (healAmount > 0) {
        currentHp[event.attackerLabel] = Math.min(
          maxHp[event.attackerLabel],
          currentHp[event.attackerLabel] + healAmount,
        )
        lifesteal = {
          healAmount,
          attackerHpAfter: currentHp[event.attackerLabel],
          attackerMaxHp: maxHp[event.attackerLabel],
        }
      }
    }

    timeline.push({
      kind: 'attack',
      time: event.time,
      attackerLabel: event.attackerLabel,
      targetLabel: event.targetLabel,
      damage,
      isCrit,
      isBlocked,
      targetHpAfter: currentHp[event.targetLabel],
      targetMaxHp: maxHp[event.targetLabel],
      lifesteal,
      abilityLabel: ability?.label,
    })

    if (currentHp[event.targetLabel] <= 0) {
      timeline.push({
        kind: 'victory',
        time: event.time,
        winnerLabel: event.attackerLabel,
      })
      break
    }
  }

  return timeline
}

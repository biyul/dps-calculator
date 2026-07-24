import type { AttackEvent, RegenEvent } from './simulator.ts'

export function eventOrder(event: AttackEvent | RegenEvent): number {
  if (event.kind === 'attack') return event.attackerLabel === 'Player' ? 0 : 1
  return 2
}

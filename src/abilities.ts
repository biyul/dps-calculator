// Ability definitions for the DPS calculator. Each ability is a simple on/off toggle;
// mechanics are wired up per-ability once defined.
export interface Ability {
  key: string
  label: string
}

export const ABILITIES: Ability[] = [{ key: 'fireball', label: 'Fireball' }]

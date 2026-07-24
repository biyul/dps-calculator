// Ability definitions for the DPS calculator. Each ability is a simple on/off toggle;
// when enabled and enough MP is available, it's used instead of a normal attack.
// Damage = baseDamage + intScaling * Intelligence (intScaling of 1 == "+100% INT").
export interface Ability {
  key: string
  label: string
  mpCost?: number
  baseDamage?: number
  intScaling?: number
}

export const ABILITIES: Ability[] = [
  { key: 'fireball', label: 'Fireball', mpCost: 100, baseDamage: 250, intScaling: 1 },
]

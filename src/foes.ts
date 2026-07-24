// Foe presets selectable from the Fight tab. Each preset only fixes Core Stats;
// everything else (Attributes, Equipment) previews at its default/zero value.
import { STATS } from './stats.ts'
import type { StatValues } from './useCombatantStats.ts'

export interface FoePreset {
  key: string
  name: string
  strength: number
  dexterity: number
  intelligence: number
}

export const FOE_PRESETS: FoePreset[] = [
  { key: 'foe0', name: 'Foe 0', strength: 0, dexterity: 0, intelligence: 0 },
  { key: 'foe20', name: 'Foe 20', strength: 20, dexterity: 20, intelligence: 20 },
  { key: 'foe50', name: 'Foe 50', strength: 50, dexterity: 50, intelligence: 50 },
]

export function getFoePreviewStats(preset: FoePreset): StatValues {
  const stats: StatValues = Object.fromEntries(STATS.map((s) => [s.key, 0]))
  stats.strength = preset.strength
  stats.dexterity = preset.dexterity
  stats.intelligence = preset.intelligence
  return stats
}

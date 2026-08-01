// Dungeons are a fixed sequence of stages the player fights/works through in order.
export type DungeonStage = { type: 'fight'; foeKey: string } | { type: 'treasure' }

export interface DungeonReward {
  xp: number
  gold: number
}

export interface Dungeon {
  key: string
  name: string
  level: number
  stages: DungeonStage[]
  reward: DungeonReward
}

export const DUNGEONS: Dungeon[] = [
  {
    key: 'rats-nest',
    name: "Rat's Nest",
    level: 1,
    stages: [
      { type: 'fight', foeKey: 'foe0' },
      { type: 'fight', foeKey: 'foe0' },
      { type: 'treasure' },
    ],
    reward: { xp: 500, gold: 500 },
  },
]

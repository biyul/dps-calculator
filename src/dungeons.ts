// Dungeons are a fixed sequence of stages the player fights/works through in order.
export type DungeonStage = { type: 'fight'; foeKey: string } | { type: 'treasure' }

export interface DungeonReward {
  xp: number
  gold: number
}

export interface KeyItem {
  key: string
  name: string
}

export interface Dungeon {
  key: string
  name: string
  level: number
  stages: DungeonStage[]
  reward: DungeonReward
  keyItem: KeyItem
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
    keyItem: { key: 'rats-nest-key', name: 'Rat Nest Key' },
  },
]

export const KEY_ITEMS: KeyItem[] = DUNGEONS.map((dungeon) => dungeon.keyItem)

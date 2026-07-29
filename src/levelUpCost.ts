// DEV: cost is just the next level (instead of Next Level * 100) to make testing faster.
export function totalLevelUpCost(level: number, totalIncrements: number): number {
  let cost = 0
  for (let i = 1; i <= totalIncrements; i++) {
    cost += level + i
  }
  return cost
}

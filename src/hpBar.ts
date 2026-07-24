const SEGMENTS = 5

export function hpBar(percent: number): string {
  const filled = Math.ceil((percent / 100) * SEGMENTS)
  return '/'.repeat(filled) + '•'.repeat(SEGMENTS - filled)
}

const MP_PER_SEGMENT = 50

export function mpBar(mp: number): string {
  return '~'.repeat(Math.floor(mp / MP_PER_SEGMENT))
}

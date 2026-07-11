import { ChallengeDef } from '../types'

export const challengeHandlers: Record<string, ChallengeDef> = {}

const defs: ChallengeDef[] = []

for (const def of defs) {
  challengeHandlers[def.slug] = def
}

export function getChallengeHandler(slug: string): ChallengeDef | undefined {
  return challengeHandlers[slug]
}

export function getAllChallengeSlugs(): string[] {
  return defs.map(d => d.slug)
}

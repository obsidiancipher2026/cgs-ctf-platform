import { ChallengeDef } from '../types'
import { documentChallenges } from './document-challenges'

export const challengeHandlers: Record<string, ChallengeDef> = {}

const defs: ChallengeDef[] = [
  ...documentChallenges,
]

for (const def of defs) {
  challengeHandlers[def.slug] = def
}

export function getChallengeHandler(slug: string): ChallengeDef | undefined {
  return challengeHandlers[slug]
}

export function getAllChallengeSlugs(): string[] {
  return defs.map(d => d.slug)
}

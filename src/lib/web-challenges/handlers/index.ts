import { ChallengeDef } from '../types'
import {
  hiddenInPlainSight, cookieJar, loginFree, hiddenInput, viewSource, guestVsAdmin,
  pathAsParameter, apiRateLimitRace, sqliSpeakeasy, pathLessTraveled, blindSqli,
  nosqlInjection, ssti, openRedirect, corsChallenge, idor, ssrf, xss,
  prototypePollution, jwtNone, csrf, xxe, raceCondition, webCachePoisoning,
} from './challenges'

export const challengeHandlers: Record<string, ChallengeDef> = {}

const defs: ChallengeDef[] = [
  hiddenInPlainSight, cookieJar, loginFree, hiddenInput, viewSource, guestVsAdmin,
  pathAsParameter, apiRateLimitRace, sqliSpeakeasy, pathLessTraveled, blindSqli,
  nosqlInjection, ssti, openRedirect, corsChallenge, idor, ssrf, xss,
  prototypePollution, jwtNone, csrf, xxe, raceCondition, webCachePoisoning,
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

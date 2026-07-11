import { ChallengeDef } from '../types'
import {
  robotsOnly, cookieMonster, viewSourceWontSaveYou, theParameterWhisperer,
  headerGames, loginOptional, directoryOfSecrets, cacheMeIfYouCan,
  theRedirectTrap, formOfTruth, blindAsABat, templateTrouble,
  xssMarksTheSpot, raceToTheFlag, jwtNone, thePathLessTraveled,
  deserializeThis, corsYouLater, graphqlGauntlet, theUploadZone,
  ssrfToTheCloud, prototypeChaos, smugglersRoute, cachePoisoningCarnival,
  xxeMarksAnotherSpot, theChainedExploit, secondOrderInjection,
  websocketWhisper, crypticSignature, theSandboxEscape,
} from './document-challenges'

export const challengeHandlers: Record<string, ChallengeDef> = {}

const defs: ChallengeDef[] = [
  robotsOnly, cookieMonster, viewSourceWontSaveYou, theParameterWhisperer,
  headerGames, loginOptional, directoryOfSecrets, cacheMeIfYouCan,
  theRedirectTrap, formOfTruth, blindAsABat, templateTrouble,
  xssMarksTheSpot, raceToTheFlag, jwtNone, thePathLessTraveled,
  deserializeThis, corsYouLater, graphqlGauntlet, theUploadZone,
  ssrfToTheCloud, prototypeChaos, smugglersRoute, cachePoisoningCarnival,
  xxeMarksAnotherSpot, theChainedExploit, secondOrderInjection,
  websocketWhisper, crypticSignature, theSandboxEscape,
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

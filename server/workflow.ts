import type { CoachAction } from './prompts.js'

export const coachStages = new Set(['diagnose','think_first','hint_1','hint_2','hint_3','answer_revealed','transfer_question','completed'])

export function nextCoachState(action: CoachAction, stage: string, hintLevel: number) {
  const safeLevel = Math.max(0, Math.min(3, Number.isInteger(hintLevel) ? hintLevel : 0))
  const nextHintLevel = action === 'hint' ? Math.min(3, safeLevel + 1) : safeLevel
  const nextStage = action === 'think' ? 'think_first'
    : action === 'hint' ? `hint_${nextHintLevel}`
    : action === 'answer' ? 'answer_revealed'
    : action === 'test' ? 'transfer_question'
    : coachStages.has(stage) ? stage : 'think_first'
  return { stage: nextStage, hintLevel: nextHintLevel }
}

import test from 'node:test'
import assert from 'node:assert/strict'
import { systemInstruction } from './prompts.js'
import { nextCoachState } from './workflow.js'
import { representativeQuestions } from './test-cases.js'

test('representative request set covers 20 categories through the single AI Coach', () => {
  assert.equal(representativeQuestions.length, 20)
  assert.equal(new Set(representativeQuestions.map(([category]) => category)).size, 20)
  assert.ok(representativeQuestions.every(([, mode]) => mode === 'coach'))
})

for (const [category, mode, action, question] of representativeQuestions) {
  test(`prompt contract: ${category} — ${question}`, () => {
    assert.ok(question.length > 8)
    const instruction = systemInstruction(mode, { action, stage: 'think_first', hintLevel: 0, responseStyle: 'think_first' })
    assert.match(instruction, /patient, encouraging/i)
  })
}

test('coach actions advance through a bounded hint sequence and explicit answer stages', () => {
  assert.deepEqual(nextCoachState('hint', 'think_first', 0), { stage: 'hint_1', hintLevel: 1 })
  assert.deepEqual(nextCoachState('hint', 'hint_1', 1), { stage: 'hint_2', hintLevel: 2 })
  assert.deepEqual(nextCoachState('hint', 'hint_2', 2), { stage: 'hint_3', hintLevel: 3 })
  assert.deepEqual(nextCoachState('hint', 'hint_3', 3), { stage: 'hint_3', hintLevel: 3 })
  assert.deepEqual(nextCoachState('answer', 'hint_1', 1), { stage: 'answer_revealed', hintLevel: 1 })
  assert.deepEqual(nextCoachState('test', 'answer_revealed', 1), { stage: 'transfer_question', hintLevel: 1 })
  assert.deepEqual(nextCoachState('think', 'answer_revealed', 1), { stage: 'think_first', hintLevel: 1 })
})

test('Think First and Instant Answer have distinct response contracts', () => {
  const context = { action: 'message' as const, stage: 'think_first', hintLevel: 0 }
  const thinkFirst = systemInstruction('coach', { ...context, responseStyle: 'think_first' })
  const instant = systemInstruction('coach', { ...context, responseStyle: 'instant_answer' })
  assert.match(thinkFirst, /at most two short sentences/)
  assert.match(thinkFirst, /do not give the final answer/)
  assert.match(instant, /Answer the request directly in this reply/)
  assert.match(instant, /Do not make the learner answer a question first/)
})

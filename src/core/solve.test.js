/** @typedef {import('./solve.js').Penalty} Penalty */

import { describe, it, expect } from 'vitest';
import { createSolve, fullSolveTime } from './solve.js';

/** @type {[Penalty, Penalty, number | null][]} */
const cases = [
    ['OK',  'OK',  10000],
    ['+2',  'OK',  12000],
    ['OK',  '+2',  12000],
    ['+2',  '+2',  14000],
    ['DNF', 'OK',  null],
    ['OK',  'DNF', null],
    ['+2',  'DNF', null],
    ['DNF', '+2',  null],
];

describe('atgriež pilno salikšanas laiku ar visiem sodiem', () => {
  it.each(cases)('inspekcijas sods %s, liciena sods %s -> %s', (inspectionPenalty, solvePenalty, expected) => {
    const solve = createSolve({ number: 1, startedAt: 1, timeMs: 10000, inspectionPenalty, solvePenalty });
    expect(fullSolveTime(solve)).toBe(expected);
  });

  it('nemaina liciena datus', () => {
    const solve = createSolve({ number: 1, startedAt: 1, timeMs: 10000, solvePenalty: '+2' });
    fullSolveTime(solve);
    expect(solve.timeMs).toBe(10000);
  });
});
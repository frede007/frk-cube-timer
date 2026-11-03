import { describe, it, expect } from 'vitest';
import { createSolve } from './solve.js';
import { bestSolve , sessionMean } from './stats.js';
 
/** @typedef {import('./solve.js').Penalty} Penalty */
 
/**
 * Palīgfunkcija: izveido licienu ar norādīto numuru un laiku. startedAt = numurs, lai saraksts būtu hronoloģiski sakārtots.
 * @param {number} number
 * @param {number} timeMs
 * @param {{ inspectionPenalty?: Penalty, solvePenalty?: Penalty }} [penalties]
 */
function makeSolve(number, timeMs, penalties = {}) {
  return createSolve({ number, startedAt: number, timeMs, ...penalties });
}
 
describe('bestSolve', () => {
  it('atgriež null, ja saraksts ir tukšs', () => {
    expect(bestSolve([])).toBeNull();
  });
 
  it('atgriež vienīgo licienu', () => {
    const list = [makeSolve(1, 10000)];
    expect(bestSolve(list)).toBe(list[0]);
  });
 
  it('atgriež licienu ar mazāko laiku, ja saraksts nav sakārtots pēc laika', () => {
    const list = [makeSolve(1, 12000), makeSolve(2, 9000), makeSolve(3, 15000)];
    expect(bestSolve(list)).toBe(list[1]);
  });
 
  it('atgriež pirmo licienu, ja labākie laiki ir vienādi', () => {
    const list = [makeSolve(1, 10000), makeSolve(2, 9000), makeSolve(3, 9000)];
    expect(bestSolve(list)).toBe(list[1]);
    expect(bestSolve(list)).not.toBe(list[2]);
  });
 
  it('izlaiž DNF licienus', () => {
    const list = [makeSolve(1, 5000, { solvePenalty: 'DNF' }), makeSolve(2, 20000)];
    expect(bestSolve(list)).toBe(list[1]);
  });
 
  it('izlaiž DNF, kas iegūts inspekcijā', () => {
    const list = [makeSolve(1, 5000, { inspectionPenalty: 'DNF' }), makeSolve(2, 20000)];
    expect(bestSolve(list)).toBe(list[1]);
  });
 
  it('atgriež null, ja visi licieni ir DNF', () => {
    const list = [
      makeSolve(1, 5000, { solvePenalty: 'DNF' }),
      makeSolve(2, 6000, { inspectionPenalty: 'DNF' }),
    ];
    expect(bestSolve(list)).toBeNull();
  });
 
  it('ņem vērā +2 sodu', () => {
    const list = [makeSolve(1, 10000, { solvePenalty: '+2' }), makeSolve(2, 11000)];
    expect(bestSolve(list)).toBe(list[1]);
  });
 
  it('ņem vērā abus +2 sodus', () => {
    // 10000 + 4000 = 14000, tāpēc 13000 ir labāks
    const list = [
      makeSolve(1, 10000, { inspectionPenalty: '+2', solvePenalty: '+2' }),
      makeSolve(2, 13000),
    ];
    expect(bestSolve(list)).toBe(list[1]);
  });
 
  it('nemaina ievades sarakstu', () => {
    const list = [makeSolve(1, 12000), makeSolve(2, 9000), makeSolve(3, 15000)];
    const copy = [...list];
    bestSolve(list);
    expect(list).toEqual(copy);
  });
});

describe('sessionMean', () => {
  it('atgriež null, ja saraksts ir tukšs', () => {
    expect(sessionMean([])).toBeNull();
  });

  it('atgriež vienīgā liciena laiku', () => {
    const list = [makeSolve(1, 10000)];

    expect(sessionMean(list)).toBe(10000);
  });

  it('aprēķina vidējo laiku vairākiem licieniem', () => {
    const list = [
      makeSolve(1, 10000),
      makeSolve(2, 12000),
      makeSolve(3, 14000),
    ];

    expect(sessionMean(list)).toBe(12000);
  });

  it('aprēķina vidējo laiku arī tad, ja licieni nav sakārtoti pēc laika', () => {
    const list = [
      makeSolve(1, 15000),
      makeSolve(2, 9000),
      makeSolve(3, 12000),
    ];

    expect(sessionMean(list)).toBe(12000);
  });

  it('izlaiž DNF licienus', () => {
    const list = [
      makeSolve(1, 10000, { solvePenalty: 'DNF' }),
      makeSolve(2, 12000),
      makeSolve(3, 14000),
    ];

    expect(sessionMean(list)).toBe(13000);
  });

  it('izlaiž DNF, kas iegūts inspekcijā', () => {
    const list = [
      makeSolve(1, 10000, { inspectionPenalty: 'DNF' }),
      makeSolve(2, 12000),
      makeSolve(3, 14000),
    ];

    expect(sessionMean(list)).toBe(13000);
  });

  it('atgriež null, ja visi licieni ir DNF', () => {
    const list = [
      makeSolve(1, 10000, { solvePenalty: 'DNF' }),
      makeSolve(2, 12000, { inspectionPenalty: 'DNF' }),
    ];

    expect(sessionMean(list)).toBeNull();
  });

  it('ņem vērā +2 sodu', () => {
    const list = [
      makeSolve(1, 10000, { solvePenalty: '+2' }),
      makeSolve(2, 14000),
    ];

    // (12000 + 14000) / 2 = 13000
    expect(sessionMean(list)).toBe(13000);
  });

  it('ņem vērā +2 sodu, kas iegūts inspekcijā', () => {
    const list = [
      makeSolve(1, 10000, { inspectionPenalty: '+2' }),
      makeSolve(2, 14000),
    ];

    expect(sessionMean(list)).toBe(13000);
  });

  it('ņem vērā abus +2 sodus', () => {
    const list = [
      makeSolve(1, 10000, {
        inspectionPenalty: '+2',
        solvePenalty: '+2',
      }),
      makeSolve(2, 12000),
    ];

    // (14000 + 12000) / 2 = 13000
    expect(sessionMean(list)).toBe(13000);
  });

  it('ņem vērā sodus, bet izlaiž DNF licienus', () => {
    const list = [
      makeSolve(1, 10000, { solvePenalty: '+2' }),
      makeSolve(2, 12000, { solvePenalty: 'DNF' }),
      makeSolve(3, 14000),
    ];

    // (12000 + 14000) / 2 = 13000
    expect(sessionMean(list)).toBe(13000);
  });

  it('nemaina ievades sarakstu', () => {
    const list = [
      makeSolve(1, 10000),
      makeSolve(2, 12000, { solvePenalty: 'DNF' }),
      makeSolve(3, 14000),
    ];
    const copy = [...list];

    sessionMean(list);

    expect(list).toEqual(copy);
  });
});

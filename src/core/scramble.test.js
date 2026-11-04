import { describe, it, expect } from 'vitest';
import { generateScramble } from './scramble.js';

describe('generateScramble', () => {
  it('ģenerē tieši 22 griezienus', () => {
    const scramble = generateScramble();
    const moves = scramble.split(' ');

    expect(moves).toHaveLength(22);
  });

  it('netiek ģenerēti secīgi griezieni uz vienas ass', () => {
    const scramble = generateScramble();
    const moves = scramble.split(' ');

    /** @type {Record<string, string>} */
    const axes = {
      U: 'y',
      D: 'y',
      R: 'x',
      L: 'x',
      F: 'z',
      B: 'z'
    };

    for (let i = 1; i < moves.length; i++) {
      const previousFace = moves[i - 1][0];
      const currentFace = moves[i][0];

      expect(axes[currentFace]).not.toBe(axes[previousFace]);
    }
  });
});
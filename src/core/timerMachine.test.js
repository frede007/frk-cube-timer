import { describe, it, expect } from 'vitest';
import { transition } from './timerMachine.js';

describe('taimera stāvokļu automāts', () => {
  it.each([
    ['idle', 'down', 'holding'],
    ['holding', 'up', 'idle'],
    ['holding', 'holdElapsed', 'ready'],
    ['holding', 'cancel', 'idle'],
    ['ready', 'up', 'running'],
    ['ready', 'cancel', 'idle'],
    ['running', 'down', 'stopped'],
    ['stopped', 'up', 'idle'],
  ])('%s + %s -> %s', (state, event, expected) => {
    expect(transition(state, event)).toBe(expected);
  });

  it('ignorē notikumus, kas stāvoklī nav atļauti', () => {
    expect(transition('idle', 'up')).toBeNull();
    expect(transition('running', 'up')).toBeNull();
    expect(transition('stopped', 'down')).toBeNull();
    expect(transition('nezināms', 'down')).toBeNull();
  });
});

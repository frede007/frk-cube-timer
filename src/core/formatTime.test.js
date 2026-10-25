import { describe, it, expect } from 'vitest';
import { formatTime } from './formatTime.js';

describe('formatTime', () => {
  it('formatē laiku zem minūtes', () => {
    expect(formatTime(0)).toBe('0.00');
    expect(formatTime(12345)).toBe('12.34'); // apgriež, nenoapaļo
    expect(formatTime(59999)).toBe('59.99');
  });

  it('formatē laiku no minūtes', () => {
    expect(formatTime(60000)).toBe('1:00.00');
    expect(formatTime(62340)).toBe('1:02.34');
  });
});

import { it, expect } from 'vitest';
import { formatDateTime } from './formatDateTime.js';

it('formatē datumu un laiku', () => {
  const ms = new Date(2026, 9, 25, 14, 32, 7).getTime();
  expect(formatDateTime(ms)).toBe('2026-10-25 14:32:07');
  expect(formatDateTime(new Date(2026, 0, 5, 3, 4, 5).getTime())).toBe('2026-01-05 03:04:05');
});
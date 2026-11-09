// Rāda 12.34 zem minūtes un 1:02.34 virs tās.
// Apgriež, nevis noapaļo, pēc WCA noteikumiem.
/**
 * Formatē laiku milisekundēs uz vēlamo formātu.
 * @param {number} ms 
 * @returns {string}
 */
export function formatTime(ms) {
  const hundredths = Math.floor(ms / 10);
  const cs = String(hundredths % 100).padStart(2, '0');
  const totalSeconds = Math.floor(hundredths / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}.${cs}`;
  }
  return `${seconds}.${cs}`;
}

/**
 * Nogriež laiku līdz sekundes simtdaļām.
 * @param {number} ms
 * @returns {number}
 */
export function truncTo100(ms) {
  return Math.floor(ms / 10) * 10;
}

/** @typedef {import('./solve.js').Solve} Solve */
import { fullSolveTime } from './solve.js';

/** 
 * @param {Solve} solve 
 * @return {string}
 */
export function formatDisplayTime(solve) {
  const time = fullSolveTime(solve);
  if (time === null) {
    return 'DNF'
  }
  let display = formatTime(time);
  if (solve.inspectionPenalty === '+2') {
    display += '+';
  }
  if (solve.solvePenalty === '+2') {
    display += '+';
  }
  return display;
}

// TODO: Write tests for formatDisplayTime function

/** 
 * @param {number | null} time
 * @return {string}
 */
export function formatDisplayAverage(time) {
  return time === null ? 'DNF' : formatTime(time);
}
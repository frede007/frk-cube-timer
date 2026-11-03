import { fullSolveTime } from './solve.js';
import { formatTime } from './formatTime.js';
/** @typedef {import('./solve.js').Solve} Solve */

/**
 * Atgriež licienu ar labāko laiku vai null, ja nav derīgu licienu
 * (tukšs saraksts vai visi DNF). Licieniem jābūt sakārtotiem hronoloģiski
 * (vecākie pirmie); vienādu laiku gadījumā tiek atgriezts pirmais.
 * @param {Solve[]} solves
 * @returns {Solve | null}
 */
export function bestSolve(solves) {
  /** @type {Solve | null} */
  let best = null;
  let bestTime = Infinity;

  for (const solve of solves) {
    const time = fullSolveTime(solve);
    if (time !== null && time < bestTime) {
      best = solve;
      bestTime = time;
    }
  }
  return best;
}

/**
 * Atgriež sesijas vidējo laiku ms (vesels skaitlis) vai null, ja nav derīgu licienu.
 * DNF licieni netiek ņemti vērā. Sodi tiek ieskaitīti.
 * @param {Solve[]} solves
 * @returns {number | null}
 */
export function sessionMean(solves) {
  let totalTime = 0;
  let count = 0;
  for (const solve of solves) {
    const time = fullSolveTime(solve);
    if (time !== null) {
      totalTime += time;
      count++;
    }
  }
  return count > 0 ? totalTime / count : null;
}
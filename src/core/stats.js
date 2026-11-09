import { fullSolveTime } from './solve.js';
import { formatTime, truncTo100 } from './formatTime.js';
/** @typedef {import('./solve.js').Solve} Solve */

/**
 * Atgriež licienu ar labāko laiku vai null, ja nav derīgu licienu
 * (tukšs saraksts vai visi DNF). Licieniem jābūt sakārtotiem hronoloģiski
 * (vecākie pirmie); vienādu laiku gadījumā tiek atgriezts pirmais.
 * @template {Solve} T
 * @param {T[]} solves
 * @returns {T | null}
 */
export function bestSolve(solves) {
  /** @type {T | null} */
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
  const mean = totalTime / count
  return count > 0 ? Math.round(mean / 10) * 10 : null;
}

/**
 * Atgriež licienu skaitu masīvā, neskaitot DNF licienus.
 * @param {Solve[]} solves
 * @returns {number}
 */
export function nonDNFSolveCount(solves) {
  let count = 0;
  for (const solve of solves) {
    if (!(solve.inspectionPenalty === 'DNF' || solve.solvePenalty === 'DNF'))
      count++;
    }
  return count;
}

/**
 * Atgriež licienu vidējo laiku, ja kāds liciens ir DNF, tad atgriež null.
 * @param {Solve[]} solves
 * @returns {number | null}
 */
export function calcMean(solves) {
  let totalTime = 0;
  for (const solve of solves) {
    const time = fullSolveTime(solve);
    if (time === null) {
      return null;
    }
    totalTime += time;
  }
  
  const mean = totalTime / solves.length;
  return solves.length > 0 ? Math.round(mean / 10) * 10 : null;
}

/**
 * Aprēķina licienu vidējo laiku, atskaitot 5% ātrāko un lēnāko rezultātu.
 * Ja pēc atskaitīšanas paliek kāds DNF, atgriež null.
 * @param {Solve[]} solves
 * @returns {number | null}
 */
export function calcAverage(solves) {
  const count = solves.length;
  if (count < 5) return null;

  const removeCount = Math.ceil(solves.length * 0.05);

  const times = [];
  for (const solve of solves) {
    const time = fullSolveTime(solve);

    times.push(time === null ? null : truncTo100(time));
  }


  const sortedTimes = times.sort((a, b) => {
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;

    return a - b;
  });

  let totalTime = 0;
  const remainingTimes = sortedTimes.slice(removeCount, sortedTimes.length - removeCount);
  for (const time of remainingTimes) {
    if (time === null) {
      return null;
    }
    totalTime += time;
  }

  const average = totalTime / remainingTimes.length;
  return Math.round(average / 10) * 10;
}

/**
 * Aprēķina pēdējo norādītā skaita licienu vidējo rezultātu.
 * @param {Solve[]} solves
 * @param {number} count
 * @returns {number | null}
 */
export function calcCurrentAverage(solves, count) {
  if (solves.length < count || count < 5) {
    return null;
  }

  const recentSolves = solves.slice(-count);

  return calcAverage(recentSolves);
}
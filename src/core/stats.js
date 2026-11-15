import { fullSolveTime } from './solve.js';
import { formatTime, truncTo100 } from './formatTime.js';
/** @typedef {import('./solve.js').Solve} Solve */

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   kind: 'single' | 'mean' | 'average',
 *   count: number
 * }} StatDefinition
 */

  /** @type {StatDefinition[]} */
  export const STAT_DEFINITIONS = [
    { id: 'single', label: 'Single', kind: 'single', count: 1 },
    { id: 'mo3', label: 'Mo3', kind: 'mean', count: 3 },
    { id: 'ao5', label: 'Ao5', kind: 'average', count: 5 },
    { id: 'ao12', label: 'Ao12', kind: 'average', count: 12 },
    { id: 'ao50', label: 'Ao50', kind: 'average', count: 50 },
    { id: 'ao100', label: 'Ao100', kind: 'average', count: 100 }
  ];

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
  if (solves.length === 0) return null;

  let totalTime = 0;

  for (const solve of solves) {
    const time = fullSolveTime(solve);

    if (time === null) {
      return null;
    }

    // WCA sacensībās laiki tiek nogriezti līdz simtdaļām, un tikai tad tiek aprēķināts vidējais laiks
    totalTime += truncTo100(time);
  }
  
  const mean = totalTime / solves.length;
  return Math.round(mean / 10) * 10;
}

/**
 * Aprēķina licienu vidējo laiku, atskaitot 5% ātrāko un lēnāko rezultātu. Minimums 5 licieni.
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

    // WCA sacensībās laiki tiek nogriezti līdz simtdaļām, un tikai tad tiek aprēķināts vidējais laiks
    times.push(time === null ? null : truncTo100(time));
  }

  const sortedTimes = times.sort((a, b) => {
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;

    return a - b;
  });

  let totalTime = 0;
  const remainingTimes = sortedTimes.slice(removeCount, sortedTimes.length - removeCount); // apgriež sarakstu no abām pusēm par aprēķināto daudzumu
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
 * Aprēķina pēdējo norādītā skaita licienu atskaitīto vidējo rezultātu, minimums 5 licieni.
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

/**
 * Aprēķina labāko atskaitīto vidējo rezultātu no visām secīgām norādītā garuma licienu grupām.
 * @param {Solve[]} solves
 * @param {number} count
 * @returns {number | null}
 */
export function calcBestAverage(solves, count) {
  if (count < 5 || solves.length < count) {
    return null;
  }

  let best = null;

  for (let i = count; i <= solves.length; i++) {
    const recentSolves = solves.slice(i - count, i);
    const average = calcAverage(recentSolves);

    if (average !== null && (best === null || average < best)) {
      best = average;
    }
  }

  return best;
}

/**
 * Aprēķina labāko aritmētisko vidējo rezultātu no visām secīgām norādītā garuma licienu grupām.
 * @param {Solve[]} solves
 * @param {number} count
 * @returns {number | null}
 */
export function calcBestMean(solves, count) {
  if (solves.length < count) {
    return null;
  }

  let best = null;

  for (let i = count; i <= solves.length; i++) {
    const recentSolves = solves.slice(i - count, i);
    const average = calcMean(recentSolves);

    if (average !== null && (best === null || average < best)) {
      best = average;
    }
  }

  return best;
}

// TODO: add tests for average and mean functions
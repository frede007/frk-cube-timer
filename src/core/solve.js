/** @typedef {'OK' | '+2' | 'DNF'} Penalty */

/**
 * @typedef {Object} Solve
 * @property {number} startedAt
 * @property {number} timeMs
 * @property {string} scramble
 * @property {string} comment
 * @property {Penalty} inspectionPenalty
 * @property {Penalty} solvePenalty
 */

/**
 * @param {Object} props
 * @param {number} props.startedAt
 * @param {number} props.timeMs
 * @param {string} props.scramble
 * @param {string} [props.comment]
 * @param {Penalty} [props.inspectionPenalty]
 * @param {Penalty} [props.solvePenalty]
 * @returns {Solve}
 */

export function createSolve({ startedAt, timeMs,  scramble, comment = '', inspectionPenalty = 'OK', solvePenalty = 'OK' }) {
    return { startedAt , timeMs , scramble, comment , inspectionPenalty , solvePenalty };
}

/**
 * Atgriež liciena laiku ms, ieskaitot sodus, vai null, ja liciens ir DNF.
 * @param {Solve} solve
 * @returns {number | null}
 */
export function fullSolveTime(solve) {
  const { timeMs, inspectionPenalty, solvePenalty } = solve;

  if (inspectionPenalty === 'DNF' || solvePenalty === 'DNF') {
    return null;
  }

  let total = timeMs;
  if (inspectionPenalty === '+2') total += 2000;
  if (solvePenalty === '+2') total += 2000;
  return total;
}


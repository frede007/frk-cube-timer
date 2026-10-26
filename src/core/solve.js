/**
 * @typedef {Object} Solve
 * @property {number} number
 * @property {number} startedAt
 * @property {number} timeMs
 * @property {string} comment
 * @property {'OK' | '+2' | 'DNF'} inspectionPenalty
 * @property {'OK' | '+2' | 'DNF'} solvePenalty
 */

/**
 * @param {Object} props
 * @param {number} props.number
 * @param {number} props.startedAt
 * @param {number} props.timeMs
 * @param {string} [props.comment]
 * @param {'OK' | '+2' | 'DNF'} [props.inspectionPenalty]
 * @param {'OK' | '+2' | 'DNF'} [props.solvePenalty]
 * @returns {Solve}
 */

export function createSolve({ number, startedAt, timeMs, comment = '', inspectionPenalty = 'OK', solvePenalty = 'OK' }) {
    return { number , startedAt , timeMs , comment , inspectionPenalty , solvePenalty };
}


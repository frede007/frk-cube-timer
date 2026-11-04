import { db } from './db.js';
/**
 * @typedef {import('../core/solve.js').Solve & {
 *   sessionId: string,
 *   number: number
 * }} SavedSolve
 */

/**
 * Iegūst visus norādītās sesijas licienus.
 *
 * @param {string} sessionId
 * @returns {Promise<SavedSolve[]>}
 */
export async function listSolves(sessionId) {
    return await db.table('solves')
        .where('sessionId')
        .equals(sessionId)
        .sortBy('number');
}

/**
 * Saglabā licienu un palielina sesijas licienu skaitītāju.
 *
 * @param {string} sessionId
 * @param {import('../../src/core/solve.js').Solve} solve
 * @returns {Promise<SavedSolve>}
 */
export async function saveSolve(sessionId, solve) {
    return await db.transaction('rw', 'sessions', 'solves', async () => {
        const sessions = db.table('sessions');
        const solves = db.table('solves');

        const session = await sessions.get(sessionId);

        if (!session) {
            throw new Error('Session not found');
        }

        const newSolve = {
            ...solve,
            sessionId,
            number: session.nextSolveNumber
        };

        await solves.add(newSolve);

        await sessions.update(sessionId, {
            nextSolveNumber: session.nextSolveNumber + 1
        });

        return newSolve;
    });
}

/**
 * Dzēš norādīto licienu no sesijas.
 *
 * @param {string} sessionId
 * @param {number} number
 */
export async function deleteSolve(sessionId, number) {
    await db.table('solves').delete([sessionId, number]);
}
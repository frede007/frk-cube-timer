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
    return await db.table('solves').where('sessionId').equals(sessionId).sortBy('number');
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
            ...solve, // iekopē vērtības no solve objekta
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
  await db.transaction('rw', 'solves', async () => {
    const solve = await db.table('solves').get([sessionId, number]);

    if (!solve) {
      throw new Error('Solve not found');
    }

    await db.table('solves').delete([sessionId, number]);
  });
}

/**
 * Atjaunina liciena komentāru vai sodu.
 * 
 * @param {string} sessionId
 * @param {number} number
 * @param {Partial<Pick<SavedSolve, 'comment' | 'solvePenalty'>>} changes
 * @returns {Promise<void>}
 */
export async function updateSolve(sessionId, number, changes) {
  const updates = {};

  if (changes.comment !== undefined) {
    updates.comment = changes.comment;
  }

  if (changes.solvePenalty !== undefined) {
    if (!['OK', '+2', 'DNF'].includes(changes.solvePenalty)) {
      throw new Error('Invalid solve penalty');
    }

    updates.solvePenalty = changes.solvePenalty;
  }

  if (Object.keys(updates).length === 0) return;

  const updated = await db.table('solves').update([sessionId, number], updates);

  if (updated === 0) {
    throw new Error('Solve not found');
  }
}
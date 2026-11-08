import { db } from './db.js';

/**
 * @typedef {Object} Session
 * @property {string} id
 * @property {string} name
 * @property {number} listIndex
 * @property {number} nextSolveNumber
 * @property {string} scrambleType
 * @property {string | null} cube
 * @property {number} createdAt
 */

/**
 * Izveido jaunu sesiju.
 */
export async function createSession(name = 'Default') {
  return await db.transaction('rw', 'sessions', async () => {
    const sessions = await listSessions();

    const nextIndex = sessions.length === 0 ? 1 : Math.max(...sessions.map(s => s.listIndex)) + 1;

    const session = {
      id: crypto.randomUUID(),
      name: name,
      listIndex: nextIndex,
      nextSolveNumber: 1,
      scrambleType: '333',
      cube: null,
      createdAt: Date.now()
    };

    await db.table('sessions').add(session);

    return session;
  });
}

/**
 * Iegūst visas sesijas.
 */
export async function listSessions() {
  const sessions = await db.table('sessions').toArray();

  return sessions.sort((a, b) => a.listIndex - b.listIndex);
}

/**
 * Atjaunina sesijas datus.
 * @param {string} sessionId 
 * @param {*} changes 
 * @returns {Promise<void>}
 */
export async function updateSession(sessionId, changes) {
  const updates = {};

  if (changes.name !== undefined || changes.name !== '') {
    updates.name = changes.name.trim();
  }

  if (changes.scrambleType !== undefined) {
    // TODO: validate scrambleType

    updates.scrambleType = changes.scrambleType;
  }
  
  if (changes.cube !== undefined) {
    // TODO: validate cube

    updates.cube = changes.cube;
  }

  if (Object.keys(updates).length === 0) return;

  const updated = await db.table('sessions').update(sessionId, updates);

  if (updated === 0) {
    throw new Error('Session not found');
  }
}


/**
 * Dzēš sesiju un tās licienus. Neļauj dzēst pēdējo sesiju.
 * @param {string} sessionId 
 */
export async function deleteSession(sessionId) {
  await db.transaction('rw', 'sessions', 'solves', async () => {
    const session = await db.table('sessions').get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    if ((await listSessions()).length <= 1) {
      throw new Error('Cannot delete the last session');
    }

    await db.table('solves').where('sessionId').equals(sessionId).delete();

    await db.table('sessions').delete(sessionId);
  });
}



// TODO: add reorder session function, working on listIndex property
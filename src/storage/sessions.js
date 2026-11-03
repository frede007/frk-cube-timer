import { db } from './db.js';

/**
 * Izveido jaunu sesiju.
 */
export async function createSession() {
    const session = {
        id: crypto.randomUUID(),
        name: 'Default',
        nextSolveNumber: 1,
        createdAt: Date.now()
    };

    await db.table('sessions').add(session);

    return session;
}

/**
 * Iegūst visas sesijas.
 */
export async function listSessions() {
    return await db.table('sessions').toArray();
}
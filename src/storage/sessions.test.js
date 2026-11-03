import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db.js';
import { createSession, listSessions } from './sessions.js';

beforeEach(async () => {
  await db.table('solves').clear();
  await db.table('sessions').clear();
});

describe('createSession', () => {
  it('izveido sesiju', async () => {
    const session = await createSession();

    expect(session.id).toBeTruthy();
    expect(session.nextSolveNumber).toBe(1);

    const storedSession = await db.table('sessions').get(session.id);

    expect(storedSession).toEqual(session);
  });

  it('katrai sesijai piešķir unikālu identifikatoru', async () => {
    const session1 = await createSession();
    const session2 = await createSession();

    expect(session1.id).not.toBe(session2.id);
  });
});

describe('listSessions', () => {
  it('atgriež visas saglabātās sesijas', async () => {
    await createSession();
    await createSession();

    const sessions = await listSessions();

    expect(sessions).toHaveLength(2);
  });

  it('atgriež tukšu masīvu, ja nav sesiju', async () => {
    const sessions = await listSessions();

    expect(sessions).toEqual([]);
  });
});
import 'fake-indexeddb/auto';
import { beforeEach, afterAll, describe, it, expect } from 'vitest';
import { db } from './db.js';
import { createSession } from './sessions.js';
import { saveSolve, deleteSolve, listSolves } from './solves.js';
import { createSolve } from '../core/solve.js';

beforeEach(async () => {
  await db.table('solves').clear();
  await db.table('sessions').clear();
});

afterAll(() => {
  db.close();
});

describe('saveSolve', () => {
  it('saglabā licienu un palielina sesijas nākamā liciena numuru', async () => {
    const session = await createSession();

    const solve = createSolve({
      startedAt: 1000000,
      timeMs: 12340
    });

    const savedSolve = await saveSolve(session.id, solve);

    const storedSolves = await listSolves(session.id);
    const updatedSession = await db.table('sessions').get(session.id);

    expect(savedSolve.number).toBe(1);
    expect(storedSolves).toHaveLength(1);
    expect(storedSolves[0].timeMs).toBe(12340);
    expect(updatedSession.nextSolveNumber).toBe(2);
  });
});

describe('deleteSolve', () => {
    it('dzēš licienu no sesijas un saglabā pareizo numerāciju', async () => {
        const session = await createSession();

        const solve1 = createSolve({ startedAt: 1000000, timeMs: 12340 });
        const solve2 = createSolve({ startedAt: 2000000, timeMs: 23450 });

        await saveSolve(session.id, solve1);
        await saveSolve(session.id, solve2);

        await deleteSolve(session.id, 2);

        const solve3 = createSolve({ startedAt: 3000000, timeMs: 34560 });
        await saveSolve(session.id, solve3);

        const storedSolves = await listSolves(session.id);
        const updatedSession = await db.table('sessions').get(session.id);

        expect(storedSolves).toHaveLength(2);
        expect(updatedSession.nextSolveNumber).toBe(4);
        expect(storedSolves.map(solve => solve.number)).toEqual([1, 3]);
        expect(storedSolves.map(solve => solve.timeMs)).toEqual([12340, 34560]);
    });
});

describe('listSolves', () => {
  it('atgriež tikai norādītās sesijas licienus', async () => {
    const session1 = await createSession();
    const session2 = await createSession();

    const solve1 = createSolve({ startedAt: 1000, timeMs: 12000 });
    const solve2 = createSolve({ startedAt: 2000, timeMs: 15000 });

    await saveSolve(session1.id, solve1);
    await saveSolve(session2.id, solve2);

    const storedSolves = await listSolves(session1.id);

    expect(storedSolves).toHaveLength(1);
    expect(storedSolves[0].timeMs).toBe(12000);
    expect(storedSolves[0].sessionId).toBe(session1.id);
  });

  it('atgriež licienus augošā secībā', async () => {
    const session = await createSession();

    await db.table('solves').bulkAdd([
      { sessionId: session.id, number: 3, timeMs: 13000 },
      { sessionId: session.id, number: 1, timeMs: 11000 },
      { sessionId: session.id, number: 2, timeMs: 12000 }
    ]);

    const storedSolves = await listSolves(session.id);

    expect(storedSolves.map(solve => solve.number)).toEqual([1, 2, 3]);
  });

  it('atgriež tukšu masīvu, ja sesijā nav licienu', async () => {
    const session = await createSession();

    const storedSolves = await listSolves(session.id);

    expect(storedSolves).toEqual([]);
  });
});

describe('saveSolve errors', () => {
  it('neļauj saglabāt licienu neeksistējošā sesijā', async () => {
    const solve = createSolve({
      startedAt: 1000,
      timeMs: 12000
    });

    await expect(
      saveSolve('nonexistent-session', solve)
    ).rejects.toThrow('Session not found');

    const storedSolves = await db.table('solves').toArray();

    expect(storedSolves).toHaveLength(0);
  });
});

it('nepalielina skaitītāju, ja liciena saglabāšana neizdodas', async () => {
  const session = await createSession();

  // Izveido ierakstu ar jau izmantotu primāro atslēgu
  await db.table('solves').add({
    sessionId: session.id,
    number: 1,
    timeMs: 10000
  });

  const solve = createSolve({
    startedAt: 2000,
    timeMs: 12000
  });

  await expect(
    saveSolve(session.id, solve)
  ).rejects.toThrow();

  const updatedSession = await db.table('sessions').get(session.id);
  const storedSolves = await listSolves(session.id);

  expect(updatedSession.nextSolveNumber).toBe(1);
  expect(storedSolves).toHaveLength(1);
  expect(storedSolves[0].timeMs).toBe(10000);
});

it('nedzēš licienus no citām sesijām', async () => {
  const session1 = await createSession();
  const session2 = await createSession();

  const solve = createSolve({
    startedAt: 1000,
    timeMs: 12000
  });

  await saveSolve(session1.id, solve);
  await saveSolve(session2.id, solve);

  await deleteSolve(session1.id, 1);

  const solves1 = await listSolves(session1.id);
  const solves2 = await listSolves(session2.id);

  expect(solves1).toHaveLength(0);
  expect(solves2).toHaveLength(1);
  expect(solves2[0].number).toBe(1);
});
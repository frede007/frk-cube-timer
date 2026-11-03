import Dexie from 'dexie';

export const db = new Dexie('frk-cube-timer');

db.version(1).stores({
    sessions: 'id',
    solves: '[sessionId+number], sessionId'
});
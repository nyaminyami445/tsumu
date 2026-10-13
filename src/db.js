import Dexie from 'dexie';

export const db = new Dexie('tsumu');

db.version(1).stores({
  goals: 'id, createdAt',
  records: 'id, goalId, date',
  images: 'id',
});

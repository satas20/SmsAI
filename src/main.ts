import { PostgresDB } from './db/postgres_service';

try {
  const db = PostgresDB.getInstance();
  await db.sync();
  console.log('Database synced successfully!');
} catch (err) {
  console.log(err);
}

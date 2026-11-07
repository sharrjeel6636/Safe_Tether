import { initDatabase } from './data/database';

export async function bootstrap(): Promise<void> {
  await initDatabase();
  console.log('SafeTether bootstrap complete.');
}

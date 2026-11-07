import { bootstrap as initBootstrap } from './bootstrap';

let isRunning = false;

export async function startRuntime(): Promise<void> {
  if (isRunning) return;
  isRunning = true;
  await initBootstrap();
  console.log('SafeTether runtime started.');
}

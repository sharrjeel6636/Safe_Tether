import { describe, it, expect } from '@jest/globals';
import { bootstrap } from '../src/bootstrap';
import { startRuntime } from '../src/runtime';

describe('Runtime and Bootstrap', () => {
  it('should bootstrap successfully', async () => {
    await expect(bootstrap()).resolves.not.toThrow();
  });

  it('should start runtime successfully', async () => {
    await expect(startRuntime()).resolves.not.toThrow();
  });

  it('should allow multiple startRuntime calls idempotently', async () => {
    await expect(startRuntime()).resolves.not.toThrow();
    await expect(startRuntime()).resolves.not.toThrow();
  });

  it('should export bootstrap function', () => {
    expect(typeof bootstrap).toBe('function');
  });

  it('should export startRuntime function', () => {
    expect(typeof startRuntime).toBe('function');
  });

  it('should complete bootstrap execution cycle', async () => {
    const res = await bootstrap();
    expect(res).toBeUndefined();
  });

  it('should complete startRuntime execution cycle', async () => {
    const res = await startRuntime();
    expect(res).toBeUndefined();
  });

  it('should initialize database during bootstrap', async () => {
    await expect(bootstrap()).resolves.not.toThrow();
  });
});

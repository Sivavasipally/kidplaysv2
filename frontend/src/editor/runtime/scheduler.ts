import { useRuntimeStore } from '../../store/runtimeStore';

export async function waitFor(seconds: number, runToken: number): Promise<boolean> {
  const ms = Math.max(0, seconds * 1000);
  const step = 50;
  let elapsed = 0;

  while (elapsed < ms) {
    if (useRuntimeStore.getState().runToken !== runToken) {
      return false;
    }

    await new Promise((resolve) => window.setTimeout(resolve, Math.min(step, ms - elapsed)));
    elapsed += step;
  }

  return useRuntimeStore.getState().runToken === runToken;
}

export async function yieldFrame(runToken: number): Promise<boolean> {
  if (useRuntimeStore.getState().runToken !== runToken) {
    return false;
  }

  await new Promise((resolve) => requestAnimationFrame(resolve));
  return useRuntimeStore.getState().runToken === runToken;
}

export const STAGE_WIDTH = 480;
export const STAGE_HEIGHT = 360;

export function scratchToCanvas(x: number, y: number): { x: number; y: number } {
  return {
    x: STAGE_WIDTH / 2 + x,
    y: STAGE_HEIGHT / 2 - y,
  };
}

export function canvasToScratch(x: number, y: number): { x: number; y: number } {
  return {
    x: x - STAGE_WIDTH / 2,
    y: STAGE_HEIGHT / 2 - y,
  };
}

export function spriteRenderSize(sizePercent: number): number {
  return Math.max(18, 74 * (sizePercent / 100));
}

export function clampToStage(x: number, y: number, size: number): { x: number; y: number } {
  const radius = spriteRenderSize(size) / 2;
  return {
    x: Math.min(STAGE_WIDTH / 2 - radius, Math.max(-STAGE_WIDTH / 2 + radius, x)),
    y: Math.min(STAGE_HEIGHT / 2 - radius, Math.max(-STAGE_HEIGHT / 2 + radius, y)),
  };
}

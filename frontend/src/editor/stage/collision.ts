import { STAGE_HEIGHT, STAGE_WIDTH, spriteRenderSize } from './stageMath';
import type { Sprite } from '../../types/sprite';

export function isSpriteOnEdge(sprite: Sprite): boolean {
  const radius = spriteRenderSize(sprite.size) / 2;
  return (
    sprite.x <= -STAGE_WIDTH / 2 + radius ||
    sprite.x >= STAGE_WIDTH / 2 - radius ||
    sprite.y <= -STAGE_HEIGHT / 2 + radius ||
    sprite.y >= STAGE_HEIGHT / 2 - radius
  );
}

export function bouncedDirection(sprite: Sprite): number {
  const radius = spriteRenderSize(sprite.size) / 2;
  let direction = sprite.direction;

  if (sprite.x <= -STAGE_WIDTH / 2 + radius || sprite.x >= STAGE_WIDTH / 2 - radius) {
    direction = 360 - direction;
  }

  if (sprite.y <= -STAGE_HEIGHT / 2 + radius || sprite.y >= STAGE_HEIGHT / 2 - radius) {
    direction = 180 - direction;
  }

  return normalizeDirection(direction);
}

export function normalizeDirection(direction: number): number {
  let result = direction % 360;
  if (result > 180) {
    result -= 360;
  }
  if (result <= -180) {
    result += 360;
  }
  return result;
}

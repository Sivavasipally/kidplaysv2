import type { Project } from '../types/project';
import { createId } from '../utils/ids';
import { nowIso } from '../utils/time';
import { createStarterSprite } from './starterSprites';

export function createBlankProject(name = 'Untitled Adventure'): Project {
  const sprite = createStarterSprite();
  const createdAt = nowIso();

  return {
    id: createId('project'),
    name,
    description: 'A local-first Scratch-inspired project.',
    createdAt,
    updatedAt: createdAt,
    sprites: [sprite],
    backdrops: [
      {
        id: 'backdrop_sky',
        name: 'Sky Playground',
        color: '#BAE6FD',
      },
    ],
    activeSpriteId: sprite.id,
    stageState: {
      width: 480,
      height: 360,
      backdropId: 'backdrop_sky',
    },
    globalVariables: {},
    version: 1,
  };
}

export function createSampleProjects(): Project[] {
  const wave = createBlankProject('Wave hello');
  const explorer = createBlankProject('Star explorer');
  explorer.sprites[0].x = -120;
  explorer.sprites[0].y = -40;
  explorer.sprites[0].direction = 70;
  explorer.updatedAt = nowIso();

  return [wave, explorer];
}

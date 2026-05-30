import type { Project } from '../types/project';
import { createId } from '../utils/ids';
import { nowIso } from '../utils/time';

export function downloadProjectJson(project: Project): void {
  const blob = new Blob([JSON.stringify(project, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${safeFilePart(project.name)}.scratch-nextgen.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function readProjectFile(file: File): Promise<Project> {
  if (!file.name.toLowerCase().endsWith('.json')) {
    throw new Error('Please choose a JSON project file.');
  }

  const text = await file.text();
  const value = JSON.parse(text) as Partial<Project>;

  if (!value.name || !Array.isArray(value.sprites)) {
    throw new Error('That file does not look like a Scratch NextGen project.');
  }

  const now = nowIso();
  return {
    ...value,
    id: createId('project'),
    name: `${value.name} (imported)`,
    createdAt: now,
    updatedAt: now,
    version: value.version ?? 1,
    backdrops: value.backdrops ?? [
      {
        id: 'backdrop_sky',
        name: 'Sky Playground',
        color: '#BAE6FD',
      },
    ],
    activeSpriteId: value.activeSpriteId ?? value.sprites[0]?.id,
    stageState: value.stageState ?? {
      width: 480,
      height: 360,
      backdropId: 'backdrop_sky',
    },
    globalVariables: value.globalVariables ?? {},
    sprites: value.sprites,
  } as Project;
}

function safeFilePart(name: string): string {
  return name
    .trim()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
    .toLowerCase() || 'scratch-nextgen-project';
}

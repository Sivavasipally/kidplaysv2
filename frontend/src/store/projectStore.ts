import { create } from 'zustand';
import type { Project } from '../types/project';
import type { Sprite } from '../types/sprite';
import {
  deleteProject as deleteProjectFromDb,
  getProject,
  listProjects,
  saveProject,
} from '../storage/projectRepository';
import { createBlankProject } from '../templates/sampleProjects';
import { createStarterSprite } from '../templates/starterSprites';
import { createId } from '../utils/ids';
import { nowIso } from '../utils/time';

type MutateOptions = {
  persist?: boolean;
  touch?: boolean;
};

type ProjectState = {
  projects: Project[];
  currentProject?: Project;
  hasHydrated: boolean;
  hydrateProjects: () => Promise<void>;
  createProject: (name?: string) => Promise<Project>;
  loadProject: (id: string) => Promise<Project | undefined>;
  saveCurrentProject: () => Promise<void>;
  importProject: (project: Project) => Promise<Project>;
  duplicateProject: (id: string) => Promise<Project | undefined>;
  renameProject: (id: string, name: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  mutateCurrentProject: (mutator: (project: Project) => void, options?: MutateOptions) => void;
  selectSprite: (spriteId: string) => void;
  updateSprite: (spriteId: string, patch: Partial<Sprite>, options?: MutateOptions) => void;
  setSpriteBlocks: (spriteId: string, blocksXml: string) => void;
  addSprite: () => void;
  deleteSprite: (spriteId: string) => void;
  resetRuntimeState: () => void;
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: undefined,
  hasHydrated: false,

  hydrateProjects: async () => {
    const projects = await listProjects();
    set({ projects, hasHydrated: true });
  },

  createProject: async (name = 'Untitled Adventure') => {
    const project = createBlankProject(name);
    await saveProject(project);
    set((state) => ({
      projects: [project, ...state.projects],
      currentProject: project,
      hasHydrated: true,
    }));
    return project;
  },

  loadProject: async (id) => {
    const project = await getProject(id);
    if (project) {
      set({ currentProject: project });
    }
    return project;
  },

  saveCurrentProject: async () => {
    const project = get().currentProject;
    if (!project) {
      return;
    }

    const next = { ...project, updatedAt: nowIso() };
    await saveProject(next);
    set((state) => ({
      currentProject: next,
      projects: upsertProject(state.projects, next),
    }));
  },

  importProject: async (project) => {
    await saveProject(project);
    set((state) => ({
      projects: [project, ...state.projects],
      currentProject: project,
      hasHydrated: true,
    }));
    return project;
  },

  duplicateProject: async (id) => {
    const project = get().projects.find((item) => item.id === id) ?? (await getProject(id));
    if (!project) {
      return undefined;
    }

    const now = nowIso();
    const duplicate: Project = {
      ...structuredClone(project),
      id: createId('project'),
      name: `${project.name} copy`,
      createdAt: now,
      updatedAt: now,
      sprites: project.sprites.map((sprite) => ({
        ...sprite,
        id: createId('sprite'),
      })),
    };
    duplicate.activeSpriteId = duplicate.sprites[0]?.id ?? '';
    await saveProject(duplicate);
    set((state) => ({
      projects: [duplicate, ...state.projects],
      currentProject: duplicate,
    }));
    return duplicate;
  },

  renameProject: async (id, name) => {
    const project = get().projects.find((item) => item.id === id) ?? (await getProject(id));
    if (!project) {
      return;
    }

    const next = { ...project, name: name.trim() || project.name, updatedAt: nowIso() };
    await saveProject(next);
    set((state) => ({
      projects: upsertProject(state.projects, next),
      currentProject: state.currentProject?.id === id ? next : state.currentProject,
    }));
  },

  deleteProject: async (id) => {
    await deleteProjectFromDb(id);
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
      currentProject: state.currentProject?.id === id ? undefined : state.currentProject,
    }));
  },

  mutateCurrentProject: (mutator, options) => {
    const project = get().currentProject;
    if (!project) {
      return;
    }

    const next = structuredClone(project);
    mutator(next);

    if (options?.touch !== false) {
      next.updatedAt = nowIso();
    }

    set((state) => ({
      currentProject: next,
      projects: upsertProject(state.projects, next),
    }));

    if (options?.persist !== false) {
      void saveProject(next);
    }
  },

  selectSprite: (spriteId) => {
    get().mutateCurrentProject((project) => {
      if (project.sprites.some((sprite) => sprite.id === spriteId)) {
        project.activeSpriteId = spriteId;
      }
    }, { persist: false, touch: false });
  },

  updateSprite: (spriteId, patch, options) => {
    get().mutateCurrentProject((project) => {
      const sprite = project.sprites.find((item) => item.id === spriteId);
      if (sprite) {
        Object.assign(sprite, patch);
      }
    }, options);
  },

  setSpriteBlocks: (spriteId, blocksXml) => {
    get().updateSprite(spriteId, { blocksXml }, { persist: true, touch: true });
  },

  addSprite: () => {
    const sprite = createStarterSprite(`Sprite ${get().currentProject?.sprites.length ?? 1}`);
    sprite.x = -120 + Math.round(Math.random() * 240);
    sprite.y = -80 + Math.round(Math.random() * 160);
    get().mutateCurrentProject((project) => {
      project.sprites.push(sprite);
      project.activeSpriteId = sprite.id;
    });
  },

  deleteSprite: (spriteId) => {
    get().mutateCurrentProject((project) => {
      if (project.sprites.length <= 1) {
        return;
      }

      project.sprites = project.sprites.filter((sprite) => sprite.id !== spriteId);
      if (project.activeSpriteId === spriteId) {
        project.activeSpriteId = project.sprites[0]?.id ?? '';
      }
    });
  },

  resetRuntimeState: () => {
    get().mutateCurrentProject((project) => {
      project.sprites = project.sprites.map((sprite, index) => ({
        ...sprite,
        x: index === 0 ? 0 : -120 + index * 80,
        y: 0,
        direction: 90,
        visible: true,
        size: 100,
        speech: undefined,
      }));
    }, { persist: false, touch: false });
  },
}));

function upsertProject(projects: Project[], project: Project): Project[] {
  const withoutCurrent = projects.filter((item) => item.id !== project.id);
  return [project, ...withoutCurrent].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

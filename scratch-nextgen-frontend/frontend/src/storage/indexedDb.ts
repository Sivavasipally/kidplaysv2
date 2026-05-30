import Dexie, { type Table } from 'dexie';
import type { Project } from '../types/project';

class ScratchNextGenDatabase extends Dexie {
  projects!: Table<Project, string>;

  constructor() {
    super('ScratchNextGenDatabase');

    this.version(1).stores({
      projects: 'id, name, updatedAt, createdAt',
    });
  }
}

export const db = new ScratchNextGenDatabase();

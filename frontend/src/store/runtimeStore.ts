import { create } from 'zustand';
import { runtimeLine } from '../utils/logger';

type RuntimeStatus = 'idle' | 'running';

type RuntimeState = {
  status: RuntimeStatus;
  logs: string[];
  runToken: number;
  startRun: () => number;
  stopRun: () => number;
  addLog: (message: string) => void;
  clearLogs: () => void;
};

export const useRuntimeStore = create<RuntimeState>((set, get) => ({
  status: 'idle',
  logs: [],
  runToken: 0,
  startRun: () => {
    const nextToken = get().runToken + 1;
    set({
      status: 'running',
      runToken: nextToken,
      logs: [runtimeLine('Green flag started the project.')],
    });
    return nextToken;
  },
  stopRun: () => {
    const nextToken = get().runToken + 1;
    set((state) => ({
      status: 'idle',
      runToken: nextToken,
      logs: [...state.logs, runtimeLine('All scripts stopped safely.')].slice(-60),
    }));
    return nextToken;
  },
  addLog: (message) => {
    set((state) => ({
      logs: [...state.logs, runtimeLine(message)].slice(-60),
    }));
  },
  clearLogs: () => set({ logs: [] }),
}));

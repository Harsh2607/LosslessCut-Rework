import { create } from 'zustand';
import type { ExportMode, FfmpegCommandLog } from '../types';

interface ExportState {
  exportConfirmOpen: boolean;
  exportMode: ExportMode;
  ffmpegCommandLog: FfmpegCommandLog;
  progress?: number | undefined;
  exportCount: number;
  currentFileExportCount: number;
  shortestFlag: boolean;

  // Actions
  setExportConfirmOpen: (open: boolean) => void;
  setExportMode: (mode: ExportMode) => void;
  setFfmpegCommandLog: (log: FfmpegCommandLog | ((prev: FfmpegCommandLog) => FfmpegCommandLog)) => void;
  addFfmpegCommandLog: (command: string) => void;
  setProgress: (progress?: number | undefined) => void;
  incrementExportCount: () => void;
  resetCurrentFileExportCount: () => void;
  setShortestFlag: (shortest: boolean) => void;
}

export const useExportStore = create<ExportState>((set) => ({
  exportConfirmOpen: false,
  exportMode: 'separate',
  ffmpegCommandLog: [],
  progress: undefined,
  exportCount: 0,
  currentFileExportCount: 0,
  shortestFlag: false,

  setExportConfirmOpen: (exportConfirmOpen) => set({ exportConfirmOpen }),
  setExportMode: (exportMode) => set({ exportMode }),
  setFfmpegCommandLog: (log) => set((s) => ({ ffmpegCommandLog: typeof log === 'function' ? log(s.ffmpegCommandLog) : log })),
  addFfmpegCommandLog: (command) => set((s) => ({
    ffmpegCommandLog: [...s.ffmpegCommandLog, { command, time: new Date() }],
  })),
  setProgress: (progress) => set({ progress }),
  incrementExportCount: () => set((s) => ({
    exportCount: s.exportCount + 1,
    currentFileExportCount: s.currentFileExportCount + 1,
  })),
  resetCurrentFileExportCount: () => set({ currentFileExportCount: 0 }),
  setShortestFlag: (shortestFlag) => set({ shortestFlag }),
}));

export default useExportStore;

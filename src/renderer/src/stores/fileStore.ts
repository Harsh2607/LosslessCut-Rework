import { create } from 'zustand';
import type { BatchFile, FilesMeta, FileStats, ParamsByFile } from '../types';
import type { FileFfprobeMeta } from '../ffmpeg';

interface FileState {
  filePath?: string | undefined;
  fileDuration?: number | undefined;
  detectedFps?: number | undefined;
  mainFileMeta?: { ffprobeMeta: FileFfprobeMeta; stats: FileStats } | undefined;
  externalFilesMeta: FilesMeta;
  paramsByFile: ParamsByFile;
  batchFiles: BatchFile[];
  selectedBatchFiles: string[];

  // Streams
  activeVideoStreamIndex?: number | undefined;
  activeAudioStreamIndexes: Set<number>;
  activeSubtitleStreamIndex?: number | undefined;

  // Actions
  setFilePath: (filePath?: string | undefined) => void;
  setFileDuration: (fileDuration?: number | undefined) => void;
  setDetectedFps: (fps?: number | undefined) => void;
  setMainFileMeta: (meta?: { ffprobeMeta: FileFfprobeMeta; stats: FileStats } | undefined) => void;
  setExternalFilesMeta: (meta: FilesMeta | ((prev: FilesMeta) => FilesMeta)) => void;
  setParamsByFile: (params: ParamsByFile | ((prev: ParamsByFile) => ParamsByFile)) => void;
  setBatchFiles: (files: BatchFile[] | ((prev: BatchFile[]) => BatchFile[])) => void;
  setSelectedBatchFiles: (files: string[] | ((prev: string[]) => string[])) => void;
  setActiveVideoStreamIndex: (idx?: number | undefined) => void;
  setActiveAudioStreamIndexes: (indexes: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
  setActiveSubtitleStreamIndex: (idx?: number | undefined) => void;
  clearFile: () => void;
}

export const useFileStore = create<FileState>((set) => ({
  filePath: undefined,
  fileDuration: undefined,
  detectedFps: undefined,
  mainFileMeta: undefined,
  externalFilesMeta: {},
  paramsByFile: new Map(),
  batchFiles: [],
  selectedBatchFiles: [],

  activeVideoStreamIndex: undefined,
  activeAudioStreamIndexes: new Set<number>(),
  activeSubtitleStreamIndex: undefined,

  setFilePath: (filePath) => set({ filePath }),
  setFileDuration: (fileDuration) => set({ fileDuration }),
  setDetectedFps: (detectedFps) => set({ detectedFps }),
  setMainFileMeta: (mainFileMeta) => set({ mainFileMeta }),
  setExternalFilesMeta: (meta) => set((s) => ({ externalFilesMeta: typeof meta === 'function' ? meta(s.externalFilesMeta) : meta })),
  setParamsByFile: (params) => set((s) => ({ paramsByFile: typeof params === 'function' ? params(s.paramsByFile) : params })),
  setBatchFiles: (batchFiles) => set((s) => ({ batchFiles: typeof batchFiles === 'function' ? batchFiles(s.batchFiles) : batchFiles })),
  setSelectedBatchFiles: (selected) => set((s) => ({ selectedBatchFiles: typeof selected === 'function' ? selected(s.selectedBatchFiles) : selected })),

  setActiveVideoStreamIndex: (activeVideoStreamIndex) => set({ activeVideoStreamIndex }),
  setActiveAudioStreamIndexes: (indexes) => set((s) => ({ activeAudioStreamIndexes: typeof indexes === 'function' ? indexes(s.activeAudioStreamIndexes) : indexes })),
  setActiveSubtitleStreamIndex: (activeSubtitleStreamIndex) => set({ activeSubtitleStreamIndex }),

  clearFile: () => set({
    filePath: undefined,
    fileDuration: undefined,
    detectedFps: undefined,
    mainFileMeta: undefined,
    externalFilesMeta: {},
    paramsByFile: new Map(),
    activeVideoStreamIndex: undefined,
    activeAudioStreamIndexes: new Set<number>(),
    activeSubtitleStreamIndex: undefined,
  }),
}));

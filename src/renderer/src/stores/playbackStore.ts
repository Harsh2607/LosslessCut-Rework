import { create } from 'zustand';
import type { PlaybackMode } from '../types';

interface PlaybackState {
  playerTime: number;
  duration: number;
  playbackRate: number;
  outputPlaybackRate: number;
  playing: boolean;
  volume: number;
  rotation: number;
  zoom: number;
  zoomWindowStartTime: number;
  hoveringTime?: number | undefined;
  startTimeOffset: number;
  playbackMode?: PlaybackMode | undefined;

  // Actions
  setPlayerTime: (time: number | ((prev: number) => number)) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  setOutputPlaybackRate: (rate: number) => void;
  setPlaying: (playing: boolean) => void;
  togglePlaying: () => void;
  setVolume: (volume: number) => void;
  setRotation: (rotation: number | ((prev: number) => number)) => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setZoomWindowStartTime: (time: number | ((prev: number) => number)) => void;
  setHoveringTime: (time?: number | undefined) => void;
  setStartTimeOffset: (offset: number) => void;
  setPlaybackMode: (mode?: PlaybackMode | undefined) => void;
  resetPlayback: () => void;
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
  playerTime: 0,
  duration: 0,
  playbackRate: 1,
  outputPlaybackRate: 1,
  playing: false,
  volume: 1,
  rotation: 360,
  zoom: 1,
  zoomWindowStartTime: 0,
  hoveringTime: undefined,
  startTimeOffset: 0,
  playbackMode: undefined,

  setPlayerTime: (time) => set((s) => ({ playerTime: typeof time === 'function' ? time(s.playerTime) : time })),
  setDuration: (duration) => set({ duration }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  setOutputPlaybackRate: (outputPlaybackRate) => set({ outputPlaybackRate }),
  setPlaying: (playing) => set({ playing }),
  togglePlaying: () => set((s) => ({ playing: !s.playing })),
  setVolume: (volume) => set({ volume }),
  setRotation: (rotation) => set((s) => ({ rotation: typeof rotation === 'function' ? rotation(s.rotation) : rotation })),
  setZoom: (zoom) => set((s) => ({ zoom: Math.max(1, typeof zoom === 'function' ? zoom(s.zoom) : zoom) })),
  setZoomWindowStartTime: (time) => set((s) => ({ zoomWindowStartTime: typeof time === 'function' ? time(s.zoomWindowStartTime) : time })),
  setHoveringTime: (hoveringTime) => set({ hoveringTime }),
  setStartTimeOffset: (startTimeOffset) => set({ startTimeOffset }),
  setPlaybackMode: (playbackMode) => set({ playbackMode }),
  resetPlayback: () => set({
    playerTime: 0,
    duration: 0,
    playbackRate: 1,
    outputPlaybackRate: 1,
    playing: false,
    rotation: 360,
    zoom: 1,
    zoomWindowStartTime: 0,
    hoveringTime: undefined,
    startTimeOffset: 0,
    playbackMode: undefined,
  }),
}));

export default usePlaybackStore;

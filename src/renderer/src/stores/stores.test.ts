import { describe, it, expect, beforeEach } from 'vitest';
import { usePlaybackStore } from './playbackStore';
import { useSegmentsStore } from './segmentsStore';
import { useFileStore } from './fileStore';
import { useExportStore } from './exportStore';
import { useUIStore } from './uiStore';

describe('Centralized Zustand Stores', () => {
  beforeEach(() => {
    usePlaybackStore.getState().resetPlayback();
    useSegmentsStore.getState().clearSegments();
    useFileStore.getState().clearFile();
  });

  describe('usePlaybackStore', () => {
    it('initializes with default playback state', () => {
      const state = usePlaybackStore.getState();
      expect(state.playerTime).toBe(0);
      expect(state.duration).toBe(0);
      expect(state.playing).toBe(false);
      expect(state.volume).toBe(1);
      expect(state.zoom).toBe(1);
    });

    it('updates playerTime and duration correctly', () => {
      const { setPlayerTime, setDuration, togglePlaying } = usePlaybackStore.getState();
      setPlayerTime(15.5);
      setDuration(120);
      togglePlaying();

      const updated = usePlaybackStore.getState();
      expect(updated.playerTime).toBe(15.5);
      expect(updated.duration).toBe(120);
      expect(updated.playing).toBe(true);
    });

    it('clamps zoom to at least 1', () => {
      const { setZoom } = usePlaybackStore.getState();
      setZoom(0.5);
      expect(usePlaybackStore.getState().zoom).toBe(1);
      setZoom(4);
      expect(usePlaybackStore.getState().zoom).toBe(4);
    });
  });

  describe('useSegmentsStore', () => {
    it('manages segments addition, updating, and active index', () => {
      const { setSegments, updateSegmentAtIndex, setActiveSegIndex } = useSegmentsStore.getState();

      setSegments([
        { segId: 'seg-1', start: 0, end: 10, name: 'Intro', segColorIndex: 0, selected: true },
        { segId: 'seg-2', start: 10, end: 25, name: 'Main', segColorIndex: 1, selected: false },
      ]);

      expect(useSegmentsStore.getState().segments).toHaveLength(2);
      expect(useSegmentsStore.getState().segments[0]?.name).toBe('Intro');

      updateSegmentAtIndex(0, { name: 'Prologue' });
      expect(useSegmentsStore.getState().segments[0]?.name).toBe('Prologue');

      setActiveSegIndex(1);
      expect(useSegmentsStore.getState().activeSegIndex).toBe(1);
    });

    it('toggles segment selection and supports bulk selection', () => {
      const { setSegments, toggleSegmentSelection, selectAllSegments } = useSegmentsStore.getState();
      setSegments([
        { segId: 'seg-1', start: 0, end: 10, name: 'Part 1', segColorIndex: 0, selected: false },
        { segId: 'seg-2', start: 10, end: 20, name: 'Part 2', segColorIndex: 1, selected: false },
      ]);

      toggleSegmentSelection('seg-1');
      expect(useSegmentsStore.getState().segments[0]?.selected).toBe(true);
      expect(useSegmentsStore.getState().segments[1]?.selected).toBe(false);

      selectAllSegments(true);
      expect(useSegmentsStore.getState().segments.every((s) => s.selected)).toBe(true);
    });
  });

  describe('useFileStore', () => {
    it('handles file metadata and active stream indices', () => {
      const { setFilePath, setFileDuration, setDetectedFps, setActiveVideoStreamIndex } = useFileStore.getState();
      setFilePath('/videos/test.mp4');
      setFileDuration(60.2);
      setDetectedFps(29.97);
      setActiveVideoStreamIndex(0);

      const state = useFileStore.getState();
      expect(state.filePath).toBe('/videos/test.mp4');
      expect(state.fileDuration).toBe(60.2);
      expect(state.detectedFps).toBe(29.97);
      expect(state.activeVideoStreamIndex).toBe(0);
    });
  });

  describe('useExportStore', () => {
    it('tracks export mode, commands, and progress', () => {
      const { setExportMode, addFfmpegCommandLog, setProgress, incrementExportCount } = useExportStore.getState();
      setExportMode('merge');
      addFfmpegCommandLog('ffmpeg -i input.mp4 -c copy out.mp4');
      setProgress(0.75);
      incrementExportCount();

      const state = useExportStore.getState();
      expect(state.exportMode).toBe('merge');
      expect(state.ffmpegCommandLog).toHaveLength(1);
      expect(state.ffmpegCommandLog[0]?.command).toContain('ffmpeg -i');
      expect(state.progress).toBe(0.75);
      expect(state.exportCount).toBe(1);
    });
  });

  describe('useUIStore', () => {
    it('manages UI visibility flags and quality levels', () => {
      const { setStreamsSelectorShown, setSettingsVisible, incrementMediaSourceQuality } = useUIStore.getState();
      setStreamsSelectorShown(true);
      setSettingsVisible(true);
      incrementMediaSourceQuality();

      const state = useUIStore.getState();
      expect(state.streamsSelectorShown).toBe(true);
      expect(state.settingsVisible).toBe(true);
      expect(state.mediaSourceQuality).toBe(1);
    });
  });
});

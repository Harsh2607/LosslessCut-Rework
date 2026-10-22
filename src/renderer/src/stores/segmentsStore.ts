import { create } from 'zustand';
import type { StateSegment, SegmentTags } from '../types';

interface SegmentsState {
  segments: StateSegment[];
  activeSegIndex: number;
  editingSegmentTagsSegmentIndex?: number | undefined;
  editingSegmentTags?: SegmentTags | undefined;

  // Actions
  setSegments: (segments: StateSegment[] | ((prev: StateSegment[]) => StateSegment[])) => void;
  updateSegmentAtIndex: (index: number, newProps: Partial<StateSegment>) => void;
  setActiveSegIndex: (index: number | ((prev: number) => number)) => void;
  setEditingSegmentTags: (tags?: SegmentTags | undefined, index?: number | undefined) => void;
  toggleSegmentSelection: (segId: string) => void;
  selectAllSegments: (selected: boolean) => void;
  clearSegments: () => void;
}

export const useSegmentsStore = create<SegmentsState>((set) => ({
  segments: [],
  activeSegIndex: 0,
  editingSegmentTagsSegmentIndex: undefined,
  editingSegmentTags: undefined,

  setSegments: (segments) => set((s) => ({ segments: typeof segments === 'function' ? segments(s.segments) : segments })),
  updateSegmentAtIndex: (index, newProps) => set((s) => {
    if (index < 0 || index >= s.segments.length) return s;
    const next = [...s.segments];
    const current = next[index];
    if (!current) return s;
    next[index] = { ...current, ...newProps };
    return { segments: next };
  }),
  setActiveSegIndex: (index) => set((s) => ({ activeSegIndex: typeof index === 'function' ? index(s.activeSegIndex) : index })),
  setEditingSegmentTags: (editingSegmentTags, editingSegmentTagsSegmentIndex) => set({
    editingSegmentTags,
    editingSegmentTagsSegmentIndex,
  }),
  toggleSegmentSelection: (segId) => set((s) => ({
    segments: s.segments.map((seg) => (seg.segId === segId ? { ...seg, selected: !seg.selected } : seg)),
  })),
  selectAllSegments: (selected) => set((s) => ({
    segments: s.segments.map((seg) => ({ ...seg, selected })),
  })),
  clearSegments: () => set({
    segments: [],
    activeSegIndex: 0,
    editingSegmentTagsSegmentIndex: undefined,
    editingSegmentTags: undefined,
  }),
}));

export default useSegmentsStore;

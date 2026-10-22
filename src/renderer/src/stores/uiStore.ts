import { create } from 'zustand';
import type { TunerType } from '../types';

export const mediaSourceQualitiesCount = 3;

interface UIState {
  streamsSelectorShown: boolean;
  concatDialogOpen: boolean;
  settingsVisible: boolean;
  keyboardShortcutsVisible: boolean;
  lastCommandsVisible: boolean;
  tunerVisible?: TunerType | undefined;
  showRightBar: boolean;
  showAdvancedSettings: boolean;
  hideCompatPlayer: boolean;
  mediaSourceQuality: number;
  encBitrate?: number | undefined;
  maxKeyframes: number;

  // Actions
  setStreamsSelectorShown: (shown: boolean | ((prev: boolean) => boolean)) => void;
  setConcatDialogOpen: (open: boolean) => void;
  setSettingsVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
  setKeyboardShortcutsVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
  setLastCommandsVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
  setTunerVisible: (tuner?: TunerType | undefined) => void;
  setShowRightBar: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowAdvancedSettings: (show: boolean | ((prev: boolean) => boolean)) => void;
  setHideCompatPlayer: (hide: boolean) => void;
  incrementMediaSourceQuality: () => void;
  setEncBitrate: (bitrate?: number | undefined) => void;
  setMaxKeyframes: (max: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  streamsSelectorShown: false,
  concatDialogOpen: false,
  settingsVisible: false,
  keyboardShortcutsVisible: false,
  lastCommandsVisible: false,
  tunerVisible: undefined,
  showRightBar: true,
  showAdvancedSettings: true,
  hideCompatPlayer: false,
  mediaSourceQuality: 0,
  encBitrate: undefined,
  maxKeyframes: 10000,

  setStreamsSelectorShown: (shown) => set((s) => ({ streamsSelectorShown: typeof shown === 'function' ? shown(s.streamsSelectorShown) : shown })),
  setConcatDialogOpen: (concatDialogOpen) => set({ concatDialogOpen }),
  setSettingsVisible: (visible) => set((s) => ({ settingsVisible: typeof visible === 'function' ? visible(s.settingsVisible) : visible })),
  setKeyboardShortcutsVisible: (visible) => set((s) => ({ keyboardShortcutsVisible: typeof visible === 'function' ? visible(s.keyboardShortcutsVisible) : visible })),
  setLastCommandsVisible: (visible) => set((s) => ({ lastCommandsVisible: typeof visible === 'function' ? visible(s.lastCommandsVisible) : visible })),
  setTunerVisible: (tunerVisible) => set({ tunerVisible }),
  setShowRightBar: (show) => set((s) => ({ showRightBar: typeof show === 'function' ? show(s.showRightBar) : show })),
  setShowAdvancedSettings: (show) => set((s) => ({ showAdvancedSettings: typeof show === 'function' ? show(s.showAdvancedSettings) : show })),
  setHideCompatPlayer: (hideCompatPlayer) => set({ hideCompatPlayer }),
  incrementMediaSourceQuality: () => set((s) => ({ mediaSourceQuality: (s.mediaSourceQuality + 1) % mediaSourceQualitiesCount })),
  setEncBitrate: (encBitrate) => set({ encBitrate }),
  setMaxKeyframes: (maxKeyframes) => set({ maxKeyframes }),
}));

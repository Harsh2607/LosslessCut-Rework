import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCaretLeft, FaCaretRight, FaPause, FaPlay } from 'react-icons/fa';
import { IoMdKey } from 'react-icons/io';
import { useFileStore } from '../stores/fileStore';
import { usePlaybackStore } from '../stores/playbackStore';
import { mirrorTransform } from '../util';

export interface StudioPlayerOsdProps {
  playing: boolean;
  togglePlay: () => void;
  shortStep: (direction: number) => void;
  seekClosestKeyframe: (direction: number) => void;
  setCutStart: () => void;
  setCutEnd: () => void;
  keyframesEnabled: boolean;
  currentFrameKeyframe?: boolean | undefined;
}

function StudioPlayerOsd({
  playing,
  togglePlay,
  shortStep,
  seekClosestKeyframe,
  setCutStart,
  setCutEnd,
  keyframesEnabled,
  currentFrameKeyframe,
}: StudioPlayerOsdProps) {
  const { t } = useTranslation();
  const detectedFps = useFileStore((s) => s.detectedFps);
  const playbackRate = usePlaybackStore((s) => s.playbackRate);

  const keyframeColor = currentFrameKeyframe ? 'var(--llc-accent)' : undefined;

  const fpsText = useMemo(() => {
    if (detectedFps == null) return '60.0 FPS';
    return `${(detectedFps * playbackRate).toFixed(1)} FPS`;
  }, [detectedFps, playbackRate]);

  return (
    <>
      {/* Top-Left Telemetry HUD */}
      <div className="studio-osd-telemetry">
        <div className="studio-telemetry-chip success">
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span>{fpsText}</span>
        </div>
        <div className="studio-telemetry-chip accent">
          <span>{t('Stream-Copy Ready')}</span>
        </div>
        {playbackRate !== 1 && (
          <div className="studio-telemetry-chip">
            <span>{playbackRate.toFixed(1)}x {t('Speed')}</span>
          </div>
        )}
      </div>

      {/* Floating Center-Bottom Quick Stepper & Transport Dock */}
      <div className="studio-osd-transport-pill">
        {keyframesEnabled && (
          <button
            type="button"
            className="studio-transport-action-btn"
            title={t('Seek previous keyframe (K)')}
            onClick={() => seekClosestKeyframe(-1)}
          >
            <IoMdKey size={16} style={{ transform: mirrorTransform, color: keyframeColor }} />
          </button>
        )}

        <button
          type="button"
          className="studio-transport-action-btn"
          title={t('One frame back (←)')}
          onClick={() => shortStep(-1)}
        >
          <FaCaretLeft size={18} />
        </button>

        <button
          type="button"
          className="studio-transport-play-btn"
          title={t('Play / Pause (Space)')}
          onClick={togglePlay}
        >
          {playing ? <FaPause size={14} /> : <FaPlay size={14} style={{ marginLeft: 2 }} />}
        </button>

        <button
          type="button"
          className="studio-transport-action-btn"
          title={t('One frame forward (→)')}
          onClick={() => shortStep(1)}
        >
          <FaCaretRight size={18} />
        </button>

        {keyframesEnabled && (
          <button
            type="button"
            className="studio-transport-action-btn"
            title={t('Seek next keyframe (L)')}
            onClick={() => seekClosestKeyframe(1)}
          >
            <IoMdKey size={16} style={{ color: keyframeColor }} />
          </button>
        )}

        <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

        <button
          type="button"
          className="studio-transport-cut-btn"
          title={t('Start current segment at current time (I)')}
          onClick={setCutStart}
        >
          [ IN
        </button>

        <button
          type="button"
          className="studio-transport-cut-btn"
          title={t('End current segment at current time (O)')}
          onClick={setCutEnd}
        >
          OUT ]
        </button>
      </div>
    </>
  );
}

export default memo(StudioPlayerOsd);

import type { ReactNode, ComponentProps } from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaList, FaFileExport, FaCut } from 'react-icons/fa';
import SegmentList from '../SegmentList';
import { useUIStore } from '../stores/uiStore';
import { useFileStore } from '../stores/fileStore';
import Button from './Button';
import ExportButton from './ExportButton';
import type { SegmentToExport } from '../types';

export interface StudioInspectorRailProps {
  width: number;
  segmentListProps: ComponentProps<typeof SegmentList>;
  onExportPress: () => void;
  segmentsToExport: SegmentToExport[];
  areWeCutting: boolean;
  setStreamsSelectorShown: (show: boolean) => void;
  numStreamsToCopy: number;
  numStreamsTotal: number;
  renderOutFmt: (style: React.CSSProperties) => ReactNode;
}

function StudioInspectorRail({
  width,
  segmentListProps,
  onExportPress,
  segmentsToExport,
  areWeCutting,
  setStreamsSelectorShown,
  numStreamsToCopy,
  numStreamsTotal,
  renderOutFmt,
}: StudioInspectorRailProps) {
  const { t } = useTranslation();
  const { studioWorkflowMode, setStudioWorkflowMode, setShowRightBar } = useUIStore();
  const mainFileMeta = useFileStore((s) => s.mainFileMeta);

  const streams = mainFileMeta?.ffprobeMeta?.streams ?? [];
  const { cutSegments } = segmentListProps;

  return (
    <aside
      className="studio-inspector-rail"
      style={{ width }}
    >
      {/* Rail Sub-Header with Mode Switching Tabs */}
      <div className="studio-rail-header">
        <div className="studio-rail-tabs">
          <button
            type="button"
            className={`studio-rail-tab-btn ${studioWorkflowMode === 'cuts' ? 'active' : ''}`}
            onClick={() => setStudioWorkflowMode('cuts')}
            title={t('Cuts & Segments')}
          >
            <FaCut style={{ marginRight: 4, verticalAlign: 'middle' }} />
            {t('Cuts')} ({cutSegments.length})
          </button>
          <button
            type="button"
            className={`studio-rail-tab-btn ${studioWorkflowMode === 'tracks' ? 'active' : ''}`}
            onClick={() => setStudioWorkflowMode('tracks')}
            title={t('Audio & Streams Matrix')}
          >
            <FaList style={{ marginRight: 4, verticalAlign: 'middle' }} />
            {t('Tracks')} ({numStreamsToCopy}/{numStreamsTotal})
          </button>
          <button
            type="button"
            className={`studio-rail-tab-btn ${studioWorkflowMode === 'export' ? 'active' : ''}`}
            onClick={() => setStudioWorkflowMode('export')}
            title={t('Export Settings')}
          >
            <FaFileExport style={{ marginRight: 4, verticalAlign: 'middle' }} />
            {t('Export')}
          </button>
        </div>

        <FaTimes
          title={t('Close sidebar')}
          style={{ cursor: 'pointer', opacity: 0.6, fontSize: 13 }}
          role="button"
          onClick={() => setShowRightBar(false)}
        />
      </div>

      {/* Rail Body: Content varies based on Active Workflow Tab */}
      {studioWorkflowMode === 'cuts' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <SegmentList {...segmentListProps} width={width} />
        </div>
      )}

      {studioWorkflowMode === 'tracks' && (
        <div className="studio-rail-body">
          <div style={{ fontSize: 12, color: 'var(--llc-text-secondary)', marginBottom: 6 }}>
            {t('Active media streams in container:')}
          </div>

          {streams.map((stream, idx) => (
            <div
              key={stream.index ?? idx}
              className="llc-card"
              style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--llc-text-primary)' }}>
                  #{stream.index} {stream.codec_type?.toUpperCase()}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: 3,
                    backgroundColor: stream.codec_type === 'video' ? 'rgba(0,243,255,0.15)' : 'rgba(16,185,129,0.15)',
                    color: stream.codec_type === 'video' ? 'var(--llc-accent)' : '#10b981',
                  }}
                >
                  {stream.codec_name?.toUpperCase()}
                </span>
              </div>

              <div style={{ fontSize: 11, fontFamily: 'var(--llc-font-mono)', color: 'var(--llc-text-muted)' }}>
                {stream.codec_type === 'video' && stream.width != null && (
                  <span>{stream.width}×{stream.height} • {stream.r_frame_rate}</span>
                )}
                {stream.codec_type === 'audio' && (
                  <span>{stream.channel_layout ?? `${stream.channels}ch`} • {stream.sample_rate} Hz</span>
                )}
                {stream.codec_type === 'subtitle' && (
                  <span>{stream.tags?.language ?? 'und'} Subtitle</span>
                )}
              </div>
            </div>
          ))}

          <Button
            onClick={() => setStreamsSelectorShown(true)}
            style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}
          >
            <FaList style={{ marginRight: 6 }} />
            {t('Advanced Track Configuration...')}
          </Button>
        </div>
      )}

      {studioWorkflowMode === 'export' && (
        <div className="studio-rail-body">
          <div style={{ fontSize: 12, color: 'var(--llc-text-secondary)', marginBottom: 6 }}>
            {t('Export Profile & Format Configuration:')}
          </div>

          <div className="llc-card" style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--llc-text-secondary)' }}>
              {t('Output Format Container')}
            </span>
            {renderOutFmt({ width: '100%' })}
          </div>

          <div className="llc-card" style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--llc-text-secondary)' }}>
              {t('Segments To Export')}
            </span>
            <div style={{ fontSize: 13, fontFamily: 'var(--llc-font-mono)', fontWeight: 600, color: 'var(--llc-accent)' }}>
              {segmentsToExport.length} {t('Segment(s)')}
            </div>
          </div>
        </div>
      )}

      {/* Rail Footer: Export Action */}
      <div className="studio-rail-footer">
        <ExportButton
          segmentsToExport={segmentsToExport}
          areWeCutting={areWeCutting}
          onClick={onExportPress}
          style={{ width: '100%', justifyContent: 'center' }}
        />
      </div>
    </aside>
  );
}

export default memo(StudioInspectorRail);

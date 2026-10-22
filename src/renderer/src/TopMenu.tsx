import type { CSSProperties, ReactNode } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { IoIosSettings, IoMdMenu } from 'react-icons/io';
import { FaFilter, FaList, FaLock, FaMoon, FaSun, FaUnlock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import Button from './components/Button';

import ExportModeButton from './components/ExportModeButton';

import { withBlur } from './util';
import { primaryTextColor, controlsBackground, darkModeTransition } from './colors';
import useUserSettings from './hooks/useUserSettings';
import useActionTitle from './hooks/useActionTitle';
import styles from './TopMenu.module.css';
import OutDirSelector from './components/OutDirSelector';
import { basename } from './util/path';
import { useFileStore } from './stores/fileStore';
import { useUIStore } from './stores/uiStore';


const { stat } = window.require('node:fs/promises');
const { webUtils } = window.require('electron');

const outFmtStyle = { maxWidth: 100 };
const exportModeStyle = { flexGrow: 0, flexBasis: 140 };

function TopMenu({
  filePath,
  fileFormat,
  changeEnabledStreamsFilter,
  applyEnabledStreamsFilter,
  enabledStreamsFilter,
  renderOutFmt,
  numStreamsToCopy,
  numStreamsTotal,
  setStreamsSelectorShown,
  toggleSettings,
  selectedSegments,
  isCustomFormatSelected,
  toggleDarkMode,
}: {
  filePath: string | undefined,
  fileFormat: string | undefined,
  changeEnabledStreamsFilter: () => void,
  applyEnabledStreamsFilter: () => void,
  enabledStreamsFilter: string | undefined,
  renderOutFmt: (style: CSSProperties) => ReactNode,
  numStreamsToCopy: number,
  numStreamsTotal: number,
  setStreamsSelectorShown: (v: boolean) => void,
  toggleSettings: () => void,
  selectedSegments: unknown[],
  isCustomFormatSelected: boolean,
  toggleDarkMode: () => void,
}) {
  const { t } = useTranslation();
  const { customOutDir, setCustomOutDir, simpleMode, outFormatLocked, setOutFormatLocked, darkMode } = useUserSettings();
  const actionTitle = useActionTitle();
  const workingDirButtonRef = useRef<HTMLButtonElement>(null);

  const mainFileMeta = useFileStore((s) => s.mainFileMeta);
  const detectedFps = useFileStore((s) => s.detectedFps);
  const { showRightBar, setShowRightBar, studioWorkflowMode, setStudioWorkflowMode } = useUIStore();

  const streams = mainFileMeta?.ffprobeMeta?.streams;
  const videoStream = useMemo(() => streams?.find((s) => s.codec_type === 'video'), [streams]);
  const audioStream = useMemo(() => streams?.find((s) => s.codec_type === 'audio'), [streams]);

  const fileName = filePath ? basename(filePath) : undefined;
  const is4k = videoStream && videoStream.width != null && videoStream.width >= 3840;
  const resolutionText = videoStream && videoStream.width != null && videoStream.height != null
    ? `${videoStream.width}×${videoStream.height}${is4k ? ' (4K)' : ''}`
    : undefined;
  const codecText = [
    videoStream?.codec_name?.toUpperCase(),
    audioStream?.codec_name?.toUpperCase(),
  ].filter(Boolean).join(' / ');

  const DarkMode = darkMode ? FaSun : FaMoon;

  const onOutFormatLockedClick = useCallback(() => setOutFormatLocked((v) => (v ? undefined : fileFormat)), [fileFormat, setOutFormatLocked]);

  const showClearWorkingDirButton = !!customOutDir;

  function renderFormatLock() {
    const Icon = outFormatLocked ? FaLock : FaUnlock;
    return (
      <Button style={{ marginRight: '.7em' }}>
        <Icon onClick={onOutFormatLockedClick} title={t('Lock/unlock output format')} style={{ fontSize: '.8em', color: outFormatLocked ? primaryTextColor : undefined }} />
      </Button>
    );
  }

  // Convenience for drag and drop: https://github.com/mifi/lossless-cut/issues/2147
  useEffect(() => {
    async function onDrop(ev: DragEvent) {
      ev.preventDefault();
      if (!ev.dataTransfer) return;
      const paths = [...ev.dataTransfer.files].map((f) => webUtils.getPathForFile(f));
      const [firstPath] = paths;
      if (paths.length === 1 && firstPath && (await stat(firstPath)).isDirectory()) {
        setCustomOutDir(firstPath);
      }
    }
    const element = workingDirButtonRef.current;
    element?.addEventListener('drop', onDrop);
    return () => element?.removeEventListener('drop', onDrop);
  }, [setCustomOutDir]);

  return (
    <div
      className={`no-user-select studio-command-header ${styles['wrapper']}`}
      style={{
        background: controlsBackground,
        transition: darkModeTransition,
      }}
    >
      {/* Zone 1 Left: Brand & File Metadata Capsule */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="studio-brand">
          <div className="studio-brand-logo">LC</div>
          <span>LosslessCut<span className="studio-brand-badge">STUDIO</span></span>
        </div>

        {filePath && (
          <div className="studio-meta-pill" title={filePath}>
            <span className="studio-meta-dot" />
            <span style={{ fontWeight: 600, color: 'var(--llc-text-primary)' }}>{fileName}</span>
            {resolutionText && (
              <>
                <span style={{ opacity: 0.4 }}>•</span>
                <span style={{ fontFamily: 'var(--llc-font-mono)' }}>{resolutionText}</span>
              </>
            )}
            {detectedFps != null && (
              <>
                <span style={{ opacity: 0.4 }}>•</span>
                <span style={{ fontFamily: 'var(--llc-font-mono)', color: 'var(--llc-accent)' }}>{detectedFps.toFixed(0)} FPS</span>
              </>
            )}
            {codecText && (
              <>
                <span style={{ opacity: 0.4 }}>•</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>{codecText}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Zone 1 Center: Workflow Switcher Tabs */}
      {filePath && !simpleMode && (
        <div className="studio-workflow-tabs">
          <button
            type="button"
            className={`studio-workflow-tab ${studioWorkflowMode === 'cuts' ? 'active' : ''}`}
            onClick={() => {
              setStudioWorkflowMode('cuts');
              setShowRightBar(true);
            }}
          >
            {t('1. Cut & Split')}
          </button>
          <button
            type="button"
            className={`studio-workflow-tab ${studioWorkflowMode === 'tracks' ? 'active' : ''}`}
            onClick={() => {
              setStudioWorkflowMode('tracks');
              setShowRightBar(true);
            }}
          >
            {t('2. Audio & Tracks')}
          </button>
          <button
            type="button"
            className={`studio-workflow-tab ${studioWorkflowMode === 'export' ? 'active' : ''}`}
            onClick={() => {
              setStudioWorkflowMode('export');
              setShowRightBar(true);
            }}
          >
            {t('3. Export Profile')}
          </button>
        </div>
      )}

      {/* Zone 1 Right: Actions, Settings & Inspector Rail Toggle */}
      <div className="studio-header-actions">
        {filePath && (
          <>
            <Button onClick={withBlur(() => setStreamsSelectorShown(true))}>
              <FaList style={{ fontSize: '.7em', marginRight: '.5em' }} />
              {t('Tracks')} ({numStreamsToCopy}/{numStreamsTotal})
            </Button>

            {enabledStreamsFilter != null && (
              <Button
                onClick={withBlur(() => applyEnabledStreamsFilter())}
                title={actionTitle(t('Toggle tracks using current filter'), 'toggleStripCurrentFilter')}
              >
                <FaFilter style={{ fontSize: '.8em', verticalAlign: 'middle' }} />
              </Button>
            )}

            <Button onClick={changeEnabledStreamsFilter}>
              {enabledStreamsFilter == null && <FaFilter style={{ fontSize: '.7em', marginRight: '.4em' }} />}
              {t('Filter tracks')}
            </Button>
          </>
        )}

        <OutDirSelector>
          <Button
            ref={workingDirButtonRef}
            title={customOutDir}
            style={{ paddingLeft: showClearWorkingDirButton ? '.4em' : undefined }}
          >
            {customOutDir ? t('Working dir set') : t('Working dir unset')}
          </Button>
        </OutDirSelector>

        {renderOutFmt(outFmtStyle)}

        {!simpleMode && (isCustomFormatSelected || outFormatLocked) && renderFormatLock()}

        {filePath && (
          <ExportModeButton selectedSegments={selectedSegments} style={exportModeStyle} />
        )}

        {!simpleMode && (
          <Button onClick={toggleDarkMode} title={actionTitle(t('Toggle dark mode'), 'toggleDarkMode')}>
            <DarkMode style={{ verticalAlign: 'middle', fontSize: '.9em' }} />
          </Button>
        )}

        <Button onClick={toggleSettings} title={actionTitle(t('Settings'), 'toggleSettings')}>
          <IoIosSettings style={{ fontSize: '1em', verticalAlign: 'bottom' }} />
        </Button>

        {filePath && (
          <Button
            onClick={() => setShowRightBar((v) => !v)}
            title={actionTitle(showRightBar ? t('Hide inspector rail') : t('Show inspector rail'), 'toggleSegmentsList')}
            style={{ color: showRightBar ? 'var(--llc-accent)' : undefined }}
          >
            <IoMdMenu style={{ fontSize: '1.1em', verticalAlign: 'middle' }} />
          </Button>
        )}
      </div>
    </div>
  );
}

export default memo(TopMenu);

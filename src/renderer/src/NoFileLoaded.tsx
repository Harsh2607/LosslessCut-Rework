import { Fragment, memo, useMemo, useState } from 'react';
import type { MotionStyle } from 'motion/react';
import { motion } from 'motion/react';
import { FiUploadCloud, FiFilm } from 'react-icons/fi';
import { useTranslation, Trans } from 'react-i18next';

import SimpleModeButton from './components/SimpleModeButton';
import useUserSettings from './hooks/useUserSettings';
import type { StateSegment } from './types';
import type { KeyBinding } from '../../common/types';
import { splitKeyboardKeys } from './util';
import Kbd from './components/Kbd';
import mainApi from './mainApi';


function Keys({ keys }: { keys: string | undefined }) {
  if (keys == null || keys === '') {
    return <kbd>UNBOUND</kbd>;
  }
  const split = splitKeyboardKeys(keys);
  return split.map((key, i) => (
    <Fragment key={key}><Kbd code={key} />{i < split.length - 1 && <span style={{ fontSize: '.7em', marginLeft: '-.2em', marginRight: '-.2em' }}>{' + '}</span>}</Fragment>
  ));
}

const containerStyle: MotionStyle = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2em',
  background: 'radial-gradient(ellipse at 50% 45%, rgba(2, 132, 199, 0.12) 0%, rgba(0, 0, 0, 0) 70%)',
};

const supportedFormats = ['MP4', 'MKV', 'MOV', 'WEBM', 'MP3', 'WAV', 'M4A', 'FLAC'];

function NoFileLoaded({ mifiLink, onClick, darkMode, keyBindingByAction }: {
  mifiLink: unknown,
  currentCutSeg?: StateSegment | undefined,
  onClick: () => void,
  darkMode?: boolean,
  keyBindingByAction: Record<string, KeyBinding>,
}) {
  const { t } = useTranslation();
  const { simpleMode, setSimpleMode } = useUserSettings();
  const [dragging, setDragging] = useState(false);

  const isMac = useMemo(() => typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform), []);

  return (
    <div className="no-user-select" style={containerStyle as React.CSSProperties}>
      <motion.div
        className={`pro-dropzone-card ${dragging ? 'pro-dropzone-dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(14, 165, 233, 0.1) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 0 24px rgba(2, 132, 199, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8',
            fontSize: 32,
            marginBottom: '1.2em',
          }}
        >
          {dragging ? <FiUploadCloud /> : <FiFilm />}
        </div>

        <div style={{ fontSize: '1.45em', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--gray-12)', marginBottom: '.3em', textAlign: 'center' }}>
          {dragging ? t('Release to open media') : t('Drop media file here')}
        </div>

        <div style={{ fontSize: '0.92em', color: 'var(--gray-11)', marginBottom: '1.2em', textAlign: 'center' }}>
          <Trans>or click anywhere to browse files</Trans>
          <span style={{ marginLeft: '.5em' }}>
            <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd> + <kbd>O</kbd>
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', maxWidth: 420, marginBottom: '1.2em' }}>
          {supportedFormats.map((fmt) => (
            <span key={fmt} className="format-pill">{fmt}</span>
          ))}
        </div>

        <div style={{ fontSize: '0.78em', color: 'var(--cyan-11)', opacity: 0.85, fontWeight: 500, letterSpacing: '0.02em', textAlign: 'center' }}>
          ⚡ {t('Lossless stream-copy')} • {t('Zero quality loss')} • {t('Instant export')}
        </div>
      </motion.div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1em', marginTop: '1.5em', fontSize: '0.85em', color: 'var(--gray-11)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.4em' }}>
          <span><Trans>Shortcuts:</Trans></span>
          <span><Keys keys={keyBindingByAction['setCutStart']?.keys} /> <span style={{ opacity: 0.7 }}>{t('Start')}</span></span>
          <span>•</span>
          <span><Keys keys={keyBindingByAction['setCutEnd']?.keys} /> <span style={{ opacity: 0.7 }}>{t('End')}</span></span>
          <span>•</span>
          <span><Keys keys={keyBindingByAction['togglePlayResetSpeed']?.keys} /> <span style={{ opacity: 0.7 }}>{t('Play')}</span></span>
        </div>

        <span>•</span>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setSimpleMode(!simpleMode); }}
          style={{ display: 'flex', alignItems: 'center', gap: '.4em', background: 'none', border: 'none', color: 'inherit', padding: 0, font: 'inherit', cursor: 'pointer' }}
        >
          <SimpleModeButton style={{ verticalAlign: 'middle' }} />
          <span>{simpleMode ? t('Show advanced view') : t('Show simple view')}</span>
        </button>
      </div>

      {mifiLink && typeof mifiLink === 'object' && 'loadUrl' in mifiLink && typeof mifiLink.loadUrl === 'string' && mifiLink.loadUrl ? (
        <div style={{ position: 'relative', marginTop: '1em', width: '24em', height: '6em' }}>
          <iframe src={`${mifiLink.loadUrl}#dark=${darkMode ? 'true' : 'false'}`} title="iframe" style={{ background: 'rgba(0,0,0,0)', border: 'none', pointerEvents: 'none', width: '100%', height: '100%', position: 'absolute', colorScheme: 'initial' }} />
          <div style={{ width: '100%', height: '100%', position: 'absolute', cursor: 'pointer' }} title={t('Open link in browser')} role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); if ('targetUrl' in mifiLink && typeof mifiLink.targetUrl === 'string') void mainApi.openExternal(mifiLink.targetUrl); }} />
        </div>
      ) : undefined}
    </div>
  );
}

export default memo(NoFileLoaded);

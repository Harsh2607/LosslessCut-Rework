import type { BrowserWindow, MenuItem, MenuItemConstructorOptions } from 'electron';
// eslint-disable-next-line import/no-extraneous-dependencies
import electron from 'electron';
import { t } from 'i18next';

import { homepageUrl, getReleaseUrl, licensesUrl, thanksUrl, usageUrl, faqUrl, troubleshootingUrl, featureRequestUrl, githubUrl } from '../common/constants.js';
import { logFilePath } from './logger.js';
import { getConfigPath } from './configStore.js';

// menu-safe i18n.t:
// https://github.com/mifi/lossless-cut/issues/1456
const esc = (val: string) => val.replaceAll('&', '&&');

const { Menu } = electron;

export default ({ app, mainWindow, newVersion, isStoreBuild, openExternal }: {
  app: Electron.App,
  mainWindow: BrowserWindow,
  newVersion?: string | undefined,
  isStoreBuild: boolean,
  openExternal: (url: string) => void,
}) => {
  const send = (channel: string, ...args: unknown[]) => {
    mainWindow.webContents.send(channel, ...args);
  };

  const action = (labelKey: string, channel: string, ...args: unknown[]): MenuItemConstructorOptions => ({
    label: esc(t(labelKey)),
    click: () => send(channel, ...args),
  });

  const link = (labelKey: string, url: string): MenuItemConstructorOptions => ({
    label: esc(t(labelKey)),
    click: () => openExternal(url),
  });

  const importFormats: [string, string][] = [
    ['Times in seconds (CSV)', 'csv'],
    ['Frame numbers (CSV)', 'csv-frames'],
    ['Cutlist', 'cutlist'],
    ['EDL', 'edl'],
    ['Text chapters / YouTube', 'youtube'],
    ['DaVinci Resolve / Final Cut Pro XML', 'xmeml'],
    ['Final Cut Pro FCPX / FCPXML', 'fcpxml'],
    ['CUE sheet file', 'cue'],
    ['PotPlayer Bookmarks (.pbf)', 'pbf'],
    ['Subtitles (SRT)', 'srt'],
    ['DV Analyzer Summary.txt', 'dv-analyzer-summary-txt'],
    ['OpenTimelineIO', 'otio'],
  ];

  const exportFormats: [string, string][] = [
    ['Times in seconds (CSV)', 'csv'],
    ['Timestamps (CSV)', 'csv-human'],
    ['Frame numbers (CSV)', 'csv-frames'],
    ['Timestamps (TSV/TXT)', 'tsv-human'],
    ['Subtitles (SRT)', 'srt'],
  ];

  const segmentGroups: [string, string][][] = [
    [
      ['Create num segments', 'createNumSegments'],
      ['Create fixed duration segments', 'createFixedDurationSegments'],
      ['Create byte sized segments', 'createFixedByteSizedSegments'],
      ['Create random segments', 'createRandomSegments'],
      ['Create segments from keyframes', 'createSegmentsFromKeyframes'],
    ],
    [
      ['Reorder segments by start time', 'reorderSegsByStartTime'],
      ['Shuffle segments order', 'shuffleSegments'],
    ],
    [
      ['Combine overlapping segments', 'combineOverlappingSegments'],
      ['Combine selected segments', 'combineSelectedSegments'],
      ['Split segment at cursor', 'splitCurrentSegment'],
      ['Invert all segments on timeline', 'invertAllSegments'],
      ['Fill gaps between segments', 'fillSegmentsGaps'],
    ],
    [
      ['Shift all segments on timeline', 'shiftAllSegmentTimes'],
      ['Align segment times to keyframes', 'alignSegmentTimesToKeyframes'],
    ],
    [
      ['Clear all segments', 'clearSegments'],
    ],
  ];

  const toolActions: [string, string][] = [
    ['Merge/concatenate files', 'concatBatch'],
    ['Set custom start offset/timecode', 'setStartTimeOffset'],
    ['Detect black scenes', 'detectBlackScenes'],
    ['Detect silent scenes', 'detectSilentScenes'],
    ['Detect scene changes', 'detectSceneChanges'],
    ['Read all keyframes', 'readAllKeyframes'],
    ['Last ffmpeg commands', 'toggleLastCommands'],
  ];

  const menu: (MenuItemConstructorOptions | MenuItem)[] = [
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' as const }] : []),

    {
      label: esc(t('File')),
      submenu: [
        {
          label: esc(t('Open')),
          accelerator: 'CmdOrCtrl+O',
          click: () => send('openFilesDialog'),
        },
        {
          label: esc(t('Open folder')),
          click: () => send('openDirDialog'),
        },
        {
          label: esc(t('Open URL')),
          click: () => send('promptDownloadMediaUrl'),
        },
        { type: 'separator' },
        {
          label: esc(t('Close')),
          accelerator: 'CmdOrCtrl+W',
          click: () => send('closeCurrentFile'),
        },
        {
          label: esc(t('Close batch')),
          click: () => send('closeBatch'),
        },
        { type: 'separator' },
        action('Import project (LLC)...', 'importEdlFile', 'llc'),
        action('Export project (LLC)...', 'exportEdlFile', 'llc'),
        {
          label: esc(t('Import project')),
          submenu: importFormats.map(([labelKey, format]) => action(labelKey, 'importEdlFile', format)),
        },
        {
          label: esc(t('Export project')),
          submenu: [
            ...exportFormats.map(([labelKey, format]) => action(labelKey, 'exportEdlFile', format)),
            action('Start times as YouTube Chapters', 'exportYouTube'),
          ],
        },
        { type: 'separator' },
        action('Convert to supported format', 'html5ify'),
        action('Fix incorrect duration', 'fixInvalidDuration'),
        action('Decimate video', 'decimate'),
        { type: 'separator' },
        {
          label: esc(t('Settings')),
          accelerator: 'CmdOrCtrl+,',
          click: () => send('toggleSettings'),
        },
        ...(process.platform !== 'darwin' ? [
          { type: 'separator' } as const,
          {
            label: esc(t('Exit')),
            accelerator: 'Ctrl+Q',
            click() {
              app.quit();
            },
          },
        ] : []),
      ],
    },

    {
      label: esc(t('Edit')),
      submenu: [
        { role: 'undo', label: esc(t('Undo')) },
        { role: 'redo', label: esc(t('Redo')) },
        { type: 'separator' },
        { role: 'cut', label: esc(t('Cut')) },
        { role: 'copy', label: esc(t('Copy')) },
        { role: 'paste', label: esc(t('Paste')) },
        { role: 'selectAll', label: esc(t('Select All')) },
        { type: 'separator' },
        {
          label: esc(t('Tracks')),
          submenu: [
            action('Extract all tracks', 'extractAllStreams'),
            action('Edit tracks / metadata tags', 'showStreamsSelector'),
          ],
        },
      ],
    },

    {
      label: esc(t('Segments')),
      submenu: segmentGroups.flatMap((group, i) => [
        ...(i > 0 ? [{ type: 'separator' as const }] : []),
        ...group.map(([label, channel]) => action(label, channel)),
      ]),
    },

    {
      label: esc(t('View')),
      submenu: [
        ...(process.platform === 'win32' ? [
          { role: 'minimize' as const, label: esc(t('Minimize')) },
          { role: 'zoom' as const, label: esc(t('Maximize')) },
        ] : []),
        { role: 'togglefullscreen', label: esc(t('Toggle Full Screen')) },
        { role: 'resetZoom', label: esc(t('Reset font size')) },
        { role: 'zoomIn', label: esc(t('Increase font size')) },
        { role: 'zoomOut', label: esc(t('Decrease font size')) },
      ],
    },

    ...(process.platform === 'darwin' ? [{ role: 'windowMenu' as const, label: esc(t('Window')) }] : []),

    {
      label: esc(t('Tools')),
      submenu: [
        ...toolActions.map(([label, channel]) => action(label, channel)),
        { type: 'separator' },
        { role: 'toggleDevTools', label: esc(t('Toggle Developer Tools')) },
      ],
    },
    {
      role: 'help',
      label: esc(t('Help')),
      submenu: [
        link('How to use', usageUrl),
        link('FAQ', faqUrl),
        link('Troubleshooting', troubleshootingUrl),
        action('Keyboard & mouse shortcuts', 'toggleKeyboardShortcuts'),
        link('Learn More', homepageUrl),
        { type: 'separator' },
        action('Report an error', 'openSendReportDialog'),
        link('Feature request', featureRequestUrl),
        ...(!isStoreBuild ? [{
          label: esc(`${t('Donate')} ❤️`),
          click() { openExternal(thanksUrl); },
        }] : []),
        { type: 'separator' },
        {
          label: esc(t('Configuration file')),
          click() { electron.shell.showItemInFolder(getConfigPath()); },
        },
        {
          label: esc(t('Log file')),
          click() { void electron.shell.openPath(logFilePath); },
        },
        { type: 'separator' },
        link('Source code', githubUrl),
        link('Licenses', licensesUrl),
        ...(process.platform !== 'darwin' ? [{
          role: 'about' as const,
          label: esc(t('About LosslessCut')),
        }] : []),
      ],
    },
  ];

  if (!isStoreBuild && newVersion) {
    menu.push({
      label: esc(t('New version!')),
      submenu: [
        {
          label: esc(t('Download {{version}}', { version: newVersion })),
          click() { openExternal(getReleaseUrl(newVersion)); },
        },
      ],
    });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
};

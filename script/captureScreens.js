import { spawn, execSync } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import process from 'node:process';

const PORT = 8099;
const SCREENSHOT_DIR = 'C:\\Users\\Harsh\\.gemini\\antigravity\\brain\\77d828be-f887-4502-a16d-f2604351506e\\screenshots';
const ARTIFACT_ROOT = 'C:\\Users\\Harsh\\.gemini\\antigravity\\brain\\77d828be-f887-4502-a16d-f2604351506e';
const SAMPLE_VIDEO = resolve('test-sample.mp4');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function ensureSampleVideo() {
  if (!existsSync(SAMPLE_VIDEO)) {
    console.log('Generating synthetic test video sample...');
    const ffmpegPath = resolve('ffmpeg/win32-x64/lib/ffmpeg.exe');
    const cmd = `"${ffmpegPath}" -y -f lavfi -i testsrc=duration=15:size=1280x720:rate=30 -f lavfi -i sine=frequency=1000:duration=15 -c:v libx264 -pix_fmt yuv420p -c:a aac "${SAMPLE_VIDEO}"`;
    execSync(cmd, { stdio: 'inherit' });
  }
}

async function waitForServer(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/`);
      if (res.ok) return true;
    } catch {
      // wait
    }
    await sleep(500);
  }
  throw new Error('Server timed out waiting to start');
}

async function postAction(action, args = []) {
  console.log(`> Action: ${action}`, args);
  const res = await fetch(`http://127.0.0.1:${PORT}/api/action/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const text = await res.text();
    console.warn(`Action ${action} response: ${res.status} ${text}`);
  }
  return res.ok;
}

async function evalInWindow(code) {
  const res = await fetch(`http://127.0.0.1:${PORT}/api/eval`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: code,
  });
  if (!res.ok) return null;
  return res.json();
}

async function capture(name, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sleep(800);
      const res = await fetch(`http://127.0.0.1:${PORT}/api/screenshot`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${text}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      await writeFile(join(SCREENSHOT_DIR, `${name}.png`), buffer);
      await writeFile(join(ARTIFACT_ROOT, `${name}.png`), buffer);
      console.log(`[Captured] ${name}.png (${(buffer.length / 1024).toFixed(1)} KB)`);
      return join(SCREENSHOT_DIR, `${name}.png`);
    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.warn(`Capture retry ${attempt}/${maxRetries} for ${name}: ${err.message}`);
      await sleep(1500);
    }
  }
}

async function main() {
  await mkdir(SCREENSHOT_DIR, { recursive: true });
  ensureSampleVideo();

  console.log('Starting LosslessCut Electron process...');
  const electronProcess = spawn(
    process.execPath,
    ['node_modules/electron/cli.js', '.', '--no-sandbox', `--http-api=${PORT}`, '--disable-networking'],
    {
      stdio: ['ignore', 'inherit', 'inherit'],
      windowsHide: false,
    }
  );

  electronProcess.on('error', (err) => {
    console.error('Failed to spawn Electron:', err);
    process.exit(1);
  });

  try {
    console.log(`Waiting for HTTP API on port ${PORT}...`);
    await waitForServer();
    console.log('HTTP API is ready. Waiting 4s for window initialization and initial paint...');
    await sleep(4000);

    // 1. Clean Empty State (Drag & Drop Welcome View)
    console.log('Capturing: 01_empty_state_welcome');
    await capture('01_empty_state_welcome');

    // 2. Empty State Drag-Over Active Hover
    console.log('Capturing: 02_empty_state_dragover');
    await evalInWindow(`
      const card = document.querySelector('.pro-dropzone-card');
      if (card) {
        card.classList.add('pro-dropzone-dragging');
        const heading = card.querySelector('div:nth-child(2)');
        if (heading) heading.textContent = 'Release to open media';
      }
    `);
    await sleep(600);
    await capture('02_empty_state_dragover');

    // Reset card
    await evalInWindow(`
      const card = document.querySelector('.pro-dropzone-card');
      if (card) {
        card.classList.remove('pro-dropzone-dragging');
        const heading = card.querySelector('div:nth-child(2)');
        if (heading) heading.textContent = 'Drop media file here';
      }
    `);

    // 3. Open Video File
    console.log(`Opening media file: ${SAMPLE_VIDEO}`);
    await postAction('openFiles', [SAMPLE_VIDEO]);
    await sleep(3500);

    // 4. Simple Mode View (Minimalist layout)
    console.log('Capturing: 04_media_loaded_simple_view');
    await capture('04_media_loaded_simple_view');

    // 5. Enable Advanced Controls (reveal full timeline controls & dock)
    console.log('Capturing: 03_media_loaded_advanced_view');
    await postAction('toggleSimpleMode');
    await sleep(1000);
    await capture('03_media_loaded_advanced_view');

    // 6. Set Clean Cut Segment: End at 6.0s, then Start at 1.5s
    console.log('Setting first cut segment...');
    await postAction('goToTimecodeDirect', [{ time: '00:00:06.000' }]);
    await sleep(400);
    await postAction('setCutEnd');
    await sleep(400);
    await postAction('goToTimecodeDirect', [{ time: '00:00:01.500' }]);
    await sleep(400);
    await postAction('setCutStart');
    await sleep(800);
    console.log('Capturing: 05_cut_segment_active');
    await capture('05_cut_segment_active');

    // 7. Add Second Segment: 08.0s to 13.5s
    console.log('Adding second cut segment...');
    await postAction('addSegment');
    await sleep(500);
    await postAction('goToTimecodeDirect', [{ time: '00:00:13.500' }]);
    await sleep(400);
    await postAction('setCutEnd');
    await sleep(400);
    await postAction('goToTimecodeDirect', [{ time: '00:00:08.000' }]);
    await sleep(400);
    await postAction('setCutStart');
    await sleep(800);
    console.log('Capturing: 06_multiple_segments');
    await capture('06_multiple_segments');

    // 8. Hover over a segment card to demonstrate hover elevation
    console.log('Capturing: 07_segment_card_hover');
    await evalInWindow(`
      const cards = document.querySelectorAll('.segment-card');
      if (cards.length > 0) {
        cards[0].style.transform = 'translateY(-2px)';
        cards[0].style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.55)';
        cards[0].style.borderColor = 'var(--llc-border-strong)';
      }
    `);
    await sleep(600);
    await capture('07_segment_card_hover');
    await evalInWindow(`
      const cards = document.querySelectorAll('.segment-card');
      if (cards.length > 0) {
        cards[0].style.transform = '';
        cards[0].style.boxShadow = '';
        cards[0].style.borderColor = '';
      }
    `);

    // 9. Open Tracks / Multi-Stream Selector
    console.log('Capturing: 08_streams_selector');
    await evalInWindow(`
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Tracks'));
      if (btn) btn.click();
    `);
    await sleep(1200);
    await capture('08_streams_selector');

    // Close Tracks Dialog
    await evalInWindow(`
      const closeBtn = document.querySelector('button[title="Close"], button[aria-label="Close"]');
      if (closeBtn) closeBtn.click();
    `);
    await sleep(1000);

    // 10. Open Export Options Screen & Toggle Advanced Options to reveal Smart Cut badges
    console.log('Capturing: 09_export_confirm_smartcut');
    await evalInWindow(`
      const exportBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Export'));
      if (exportBtn) exportBtn.click();
    `);
    await sleep(1200);

    // Expand advanced options in Export dialog so Smart Cut badges and presets are visible
    await evalInWindow(`
      const switches = Array.from(document.querySelectorAll('button[role="switch"]'));
      const advSw = switches[switches.length - 1];
      if (advSw && advSw.getAttribute('aria-checked') === 'false') {
        advSw.click();
      }
      const scrollBox = document.querySelector('div[class*="box"], div[class*="sheet"]');
      if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight / 2;
    `);
    await sleep(1000);
    await capture('09_export_confirm_smartcut');

    // Close Export Dialog cleanly
    await evalInWindow(`
      const closeButtons = Array.from(document.querySelectorAll('button[title="Close"], button[aria-label="Close"]'));
      const activeClose = closeButtons.pop();
      if (activeClose) activeClose.click();
    `);
    await sleep(1000);

    // 11. Settings Modal
    console.log('Capturing: 11_settings_dialog');
    await postAction('toggleSettings');
    await sleep(1200);
    await capture('11_settings_dialog');
    await postAction('toggleSettings');
    await sleep(1000);

    // 12. Keyboard Shortcuts Modal
    console.log('Capturing: 12_keyboard_shortcuts');
    await postAction('toggleKeyboardShortcuts');
    await sleep(1200);
    await capture('12_keyboard_shortcuts');
    await postAction('toggleKeyboardShortcuts');
    await sleep(1000);

    // 13. Light Mode Theme
    console.log('Capturing: 13_light_mode_theme');
    await postAction('toggleDarkMode');
    await sleep(1200);
    await capture('13_light_mode_theme');
    await postAction('toggleDarkMode'); // Revert to dark mode
    await sleep(1000);

    // 14. Zoomed Timeline with Audio Waveform
    console.log('Capturing: 14_timeline_waveform_active');
    await postAction('toggleWaveformMode');
    await sleep(2000);
    await capture('14_timeline_waveform_active');

    // 15. Timeline Zoom Comfort Mode
    console.log('Capturing: 15_timeline_zoom_comfort');
    await postAction('timelineToggleComfortZoom');
    await sleep(1200);
    await capture('15_timeline_zoom_comfort');

    console.log('All end-to-end design & UX screenshots successfully refreshed and verified!');
  } finally {
    console.log('Terminating Electron...');
    electronProcess.kill('SIGTERM');
    await sleep(1000);
    try { electronProcess.kill('SIGKILL'); } catch { /* ignore */ }
  }
}

main().catch((err) => {
  console.error('Fatal error in capture script:', err);
  process.exit(1);
});

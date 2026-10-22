import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import process from 'node:process';

const PORT = 8099;
const SCREENSHOT_DIR = 'C:\\Users\\Harsh\\.gemini\\antigravity\\brain\\77d828be-f887-4502-a16d-f2604351506e\\screenshots';
const ARTIFACT_ROOT = 'C:\\Users\\Harsh\\.gemini\\antigravity\\brain\\77d828be-f887-4502-a16d-f2604351506e';
const SAMPLE_VIDEO = resolve('test-sample.mp4');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

async function capture(name) {
  await sleep(700);
  const res = await fetch(`http://127.0.0.1:${PORT}/api/screenshot`);
  if (!res.ok) throw new Error(`Screenshot failed: ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(join(SCREENSHOT_DIR, `${name}.png`), buffer);
  await writeFile(join(ARTIFACT_ROOT, `${name}.png`), buffer);
  console.log(`[Captured] ${name}.png (${(buffer.length / 1024).toFixed(1)} KB)`);
  return join(SCREENSHOT_DIR, `${name}.png`);
}

async function main() {
  await mkdir(SCREENSHOT_DIR, { recursive: true });

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
    console.log('HTTP API is ready. Waiting 3s for window initialization...');
    await sleep(3000);

    // 1. Clean Empty State (Drag & Drop Welcome View)
    await capture('01_empty_state_welcome');

    // 2. Open Video File
    console.log(`Opening media file: ${SAMPLE_VIDEO}`);
    await postAction('openFiles', [SAMPLE_VIDEO]);
    await sleep(3500);

    // Enable Advanced Controls (reveal full timeline controls & jump buttons)
    await postAction('toggleSimpleMode');
    await sleep(1000);
    await capture('02_media_loaded_advanced_view');

    // 3. Set Clean Cut Segment: End at 6.0s, then Start at 1.5s
    await postAction('goToTimecodeDirect', [{ time: '00:00:06.000' }]);
    await sleep(400);
    await postAction('setCutEnd');
    await sleep(400);
    await postAction('goToTimecodeDirect', [{ time: '00:00:01.500' }]);
    await sleep(400);
    await postAction('setCutStart');
    await sleep(800);
    await capture('03_cut_segment_active');

    // 4. Add Second Segment: 08.0s to 13.5s
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
    await capture('04_multiple_segments');

    // 5. Open Tracks / Multi-Stream Selector
    await evalInWindow(`
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Tracks'));
      if (btn) btn.click();
    `);
    await sleep(1200);
    await capture('05_streams_selector');

    // Close Tracks Dialog
    await evalInWindow(`
      const closeBtn = document.querySelector('button[title="Close"], button[aria-label="Close"]');
      if (closeBtn) closeBtn.click();
    `);
    await sleep(1000);

    // 6. Open Export Options Screen & Toggle Advanced Options to reveal Smart Cut badges
    await evalInWindow(`
      const exportBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Export'));
      if (exportBtn) exportBtn.click();
    `);
    await sleep(1200);

    // Expand advanced options in Export dialog so Smart Cut badges and presets are visible
    await evalInWindow(`
      const switches = Array.from(document.querySelectorAll('button[role="switch"]'));
      // The advanced switch is the last switch on screen
      const advSw = switches[switches.length - 1];
      if (advSw && advSw.getAttribute('aria-checked') === 'false') {
        advSw.click();
      }
      // Scroll dialog content to show smart cut section
      const scrollBox = document.querySelector('div[class*="box"], div[class*="sheet"]');
      if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight / 2;
    `);
    await sleep(1000);
    await capture('06_export_confirm_smartcut');

    // Close Export Dialog cleanly
    await evalInWindow(`
      const closeButtons = Array.from(document.querySelectorAll('button[title="Close"], button[aria-label="Close"]'));
      const activeClose = closeButtons.pop();
      if (activeClose) activeClose.click();
    `);
    await sleep(1000);

    // 7. Settings Modal
    await postAction('toggleSettings');
    await sleep(1200);
    await capture('07_settings_dialog');
    await postAction('toggleSettings');
    await sleep(1000);

    // 8. Keyboard Shortcuts Modal
    await postAction('toggleKeyboardShortcuts');
    await sleep(1200);
    await capture('08_keyboard_shortcuts');
    await postAction('toggleKeyboardShortcuts');
    await sleep(1000);

    // 9. Light Mode Theme
    await postAction('toggleDarkMode');
    await sleep(1200);
    await capture('09_light_mode_theme');
    await postAction('toggleDarkMode'); // Revert to dark mode
    await sleep(1000);

    // 10. Zoomed Timeline with Audio Waveform
    await postAction('toggleWaveformMode');
    await sleep(2000); // Allow ffmpeg showwavespic to generate waveform
    await capture('10_timeline_waveform_active');

    console.log('All end-to-end screenshots successfully refreshed and verified!');
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

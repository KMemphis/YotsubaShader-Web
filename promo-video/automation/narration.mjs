// Temporary narration with the macOS voice. Each segment is rate-fitted into its window so scenes stay in sync.
// Replace narration/<id>.wav with your own recordings (same names) and re-render.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const dir = new URL('../narration/', import.meta.url).pathname;
const segs = JSON.parse(fs.readFileSync(dir + 'script.json', 'utf8'));
const VOICE = process.env.VOICE || 'Samantha';
const dur = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const out = [];
for (const s of segs) {
  const window = s.end - s.start;
  // Fit the voice to the window: aim for window - 0.7 s so the speech fills the scene and still leaves a breath.
  const target = window - 0.5;
  let rate = 165, d = 0;
  for (let i = 0; i < 10; i++) {
    execFileSync('say', ['-v', VOICE, '-r', String(rate), '-o', `${dir}${s.id}.aiff`, s.text]);
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', `${dir}${s.id}.aiff`, '-ar', '48000', '-ac', '1', `${dir}${s.id}.wav`]);
    d = dur(`${dir}${s.id}.wav`);
    if (d > window - 0.2) rate = Math.min(205, Math.round(rate * (d / target)));      // too long: speed up
    else if (d < target - 1.2 && rate > 130) rate = Math.max(130, Math.round(rate * (d / target)));  // much too short: slow a bit
    else break;
  }
  fs.rmSync(`${dir}${s.id}.aiff`);
  out.push({ ...s, duration: +d.toFixed(2), rate });
  console.log(s.id, `${d.toFixed(2)}s in ${window}s window @ ${rate} wpm`);
}
fs.writeFileSync(dir + 'timing.json', JSON.stringify(out, null, 1));

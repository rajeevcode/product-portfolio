#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIDEO = path.join(__dirname, '..', 'assets', 'video');

for (const file of fs.readdirSync(VIDEO).filter((f) => f.endsWith('.webm')).sort()) {
  const webm = path.join(VIDEO, file);
  const mp4 = webm.replace(/\.webm$/i, '.mp4');
  if (fs.existsSync(mp4) && fs.statSync(mp4).mtimeMs >= fs.statSync(webm).mtimeMs) {
    console.log('skip', path.basename(mp4));
    continue;
  }
  execSync(
    `ffmpeg -y -i "${webm}" -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -movflags +faststart -an "${mp4}"`,
    { stdio: 'inherit' },
  );
  console.log('mp4', path.basename(mp4));
}

console.log('Done.');

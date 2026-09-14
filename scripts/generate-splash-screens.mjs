/**
 * generate-splash-screens.mjs
 * Generates iOS startup/splash images for standard iPhone viewport resolutions:
 * 1. iPhone 16 Pro Max / 15 Pro Max / 14 Pro Max (1290 x 2796)
 * 2. iPhone 16 Pro / 15 Pro / 14 Pro (1179 x 2556)
 * 3. iPhone 16 / 15 / 14 / 13 / 12 (1170 x 2532)
 * 4. iPhone 13 mini / 12 mini (1125 x 2436)
 * 5. iPhone Plus (1284 x 2778)
 * 
 * Each image renders:
 * - #0B0B0C background
 * - The official optically balanced app mark scaled to exactly 160-180px in center
 * - Safe area padding awareness (mark placed at exact optical vertical center 48% height)
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const masterIcon = path.join(publicDir, 'icon-master-512.png');

const devices = [
  { name: 'apple-splash-1179-2556.png', w: 1179, h: 2556, markSize: 310 }, // iPhone 14 Pro, 15, 15 Pro, 16 Pro (@3x => ~103 CSS px)
  { name: 'apple-splash-1290-2796.png', w: 1290, h: 2796, markSize: 330 }, // iPhone 14/15/16 Pro Max, Plus (@3x => ~110 CSS px)
  { name: 'apple-splash-1170-2532.png', w: 1170, h: 2532, markSize: 300 }, // iPhone 12, 13, 14 (@3x => ~100 CSS px)
  { name: 'apple-splash-1125-2436.png', w: 1125, h: 2436, markSize: 285 }, // iPhone X, XS, 11 Pro, 12/13 mini (@3x => ~95 CSS px)
  { name: 'apple-splash-1284-2778.png', w: 1284, h: 2778, markSize: 320 }, // iPhone 12/13 Pro Max, 14 Plus (@3x => ~106 CSS px)
];

async function main() {
  console.log('Generating iOS splash images...');

  for (const d of devices) {
    const markResized = await sharp(masterIcon)
      .resize(d.markSize, d.markSize)
      .png()
      .toBuffer();

    const left = Math.round((d.w - d.markSize) / 2);
    // Optical center: 47% of total height to comfortably clear bottom home indicator & top dynamic island
    const top = Math.round(d.h * 0.47 - d.markSize / 2);

    const outPath = path.join(publicDir, d.name);
    await sharp({
      create: {
        width: d.w,
        height: d.h,
        channels: 4,
        background: { r: 11, g: 11, b: 12, alpha: 1 }
      }
    })
    .composite([
      {
        input: markResized,
        top,
        left,
        blend: 'over'
      }
    ])
    .png({ compressionLevel: 8 })
    .toFile(outPath);

    console.log(`✓ ${d.name} (${d.w}x${d.h})`);
  }

  console.log('All iOS splash screens generated successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

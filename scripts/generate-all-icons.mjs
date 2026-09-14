/**
 * generate-all-icons.mjs
 * Generates all production-grade PWA, favicon, and iOS touch icons
 * using the optically centered, enlarged master icon with zero transparent padding.
 */
import sharp from 'sharp';
import { copyFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const masterIcon = path.join(publicDir, 'icon-master-512.png');

const sizes = [32, 48, 64, 76, 120, 152, 167, 180, 192, 512];

async function main() {
  console.log('Generating production icon suite from master icon...');
  
  for (const s of sizes) {
    const out = path.join(publicDir, `icon-${s}.png`);
    await sharp(masterIcon)
      .resize(s, s, {
        kernel: sharp.kernel.lanczos3
      })
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`✓ icon-${s}.png`);
  }

  // apple-touch-icon (180x180 is the recommended iOS standard)
  copyFileSync(path.join(publicDir, 'icon-180.png'), path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png (180x180)');

  // favicon.png (32x32)
  copyFileSync(path.join(publicDir, 'icon-32.png'), path.join(publicDir, 'favicon.png'));
  console.log('✓ favicon.png (32x32)');

  console.log('All icons generated cleanly.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

/**
 * gen-icons.mjs
 * Generates all required PWA icon sizes from the source logo image.
 * Usage: node scripts/gen-icons.mjs <source-image-path>
 */
import sharp from 'sharp';
import { copyFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

const src = process.argv[2];
if (!src) {
  console.error('Usage: node scripts/gen-icons.mjs <source-image-path>');
  process.exit(1);
}

const sizes = [76, 120, 180, 192, 512];

async function main() {
  for (const size of sizes) {
    const outPath = path.join(publicDir, `icon-${size}.png`);
    await sharp(src)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(outPath);
    console.log(`✓ icon-${size}.png`);
  }

  // apple-touch-icon = 180px
  copyFileSync(path.join(publicDir, 'icon-180.png'), path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png (copy of 180)');

  // favicon.png (32px, used as fallback)
  await sharp(src)
    .resize(32, 32, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✓ favicon.png (32px)');

  console.log('\nAll icons generated successfully.');
}

main().catch((e) => { console.error(e); process.exit(1); });

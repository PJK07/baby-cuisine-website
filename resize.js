import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resizeImages() {
  const assetsDir = path.join(__dirname, 'src', 'assets');
  const heroPath = path.join(assetsDir, '1190b4e7cdfa9a4c1a292a01cff92e07a48e8ab9.webp');
  const logoPath = path.join(assetsDir, '56793963f4406674327e30a2587aa6beac1f4afa.webp');

  // Hero: 640w, 1280w
  await sharp(heroPath).resize({ width: 640 }).toFile(path.join(assetsDir, 'hero-640w.webp'));
  await sharp(heroPath).resize({ width: 1280 }).toFile(path.join(assetsDir, 'hero-1280w.webp'));

  // Logo: 280w, 560w
  await sharp(logoPath).resize({ width: 280 }).toFile(path.join(assetsDir, 'logo-280w.webp'));
  await sharp(logoPath).resize({ width: 560 }).toFile(path.join(assetsDir, 'logo-560w.webp'));

  console.log('Images resized correctly.');
}

resizeImages().catch(console.error);

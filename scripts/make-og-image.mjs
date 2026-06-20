import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const pub = path.join(root, 'public', 'images');

const W = 1200;
const H = 630;
const BG = '#fbebba';

const hero = await sharp(path.join(pub, 'hero-banner.webp'))
  .resize({ height: 540, fit: 'inside' })
  .toBuffer();
const heroMeta = await sharp(hero).metadata();

const logo = await sharp(path.join(pub, 'logo-560w.webp'))
  .resize({ width: 300, fit: 'inside' })
  .toBuffer();
const logoMeta = await sharp(logo).metadata();

const textSvg = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .h1 { fill: #293313; font-family: 'Poppins', 'Segoe UI', sans-serif; font-weight: 800; font-size: 56px; }
    .accent { fill: #a85c0a; }
    .sub { fill: #4d4431; font-family: 'Poppins', 'Segoe UI', sans-serif; font-weight: 500; font-size: 26px; }
    .tag { fill: #71654b; font-family: 'Poppins', 'Segoe UI', sans-serif; font-weight: 600; font-size: 22px; }
  </style>
  <text x="70" y="295" class="h1">Made with Love,</text>
  <text x="70" y="360" class="h1 accent">for Their First Bites</text>
  <text x="70" y="420" class="sub">Fresh handmade baby food &#183; Lebanon</text>
  <text x="70" y="470" class="tag">100% natural &#183; no sugar &#183; no preservatives</text>
</svg>`);

await sharp({ create: { width: W, height: H, channels: 4, background: BG } })
  .composite([
    { input: logo, top: 70, left: 70 },
    { input: textSvg, top: 0, left: 0 },
    { input: hero, top: Math.round((H - heroMeta.height) / 2), left: W - heroMeta.width - 60 },
  ])
  .png()
  .toFile(path.join(pub, 'og-image.png'));

console.log(`og-image.png written (${W}x${H}), logo ${logoMeta.width}x${logoMeta.height}, hero ${heroMeta.width}x${heroMeta.height}`);

// Optimize the OHHO logo: create multiple sizes, inspect content
import sharp from 'sharp';
import fs from 'fs';

const SRC = '/home/z/my-project/upload/ohho logo final.png';
const OUT_DIR = '/home/z/my-project/public/ohho-images';

async function main() {
  const meta = await sharp(SRC).metadata();
  console.log('Source metadata:', meta);
  
  // Get raw pixel data stats — find bounding box of non-transparent content
  const { data, info } = await sharp(SRC)
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  let minX = info.width, minY = info.height, maxX = 0, maxY = 0;
  let hasPixels = false;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const alpha = data[idx + 3];
      if (alpha > 10) {
        hasPixels = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log(`Content bbox: (${minX},${minY}) to (${maxX},${maxY})`);
  console.log(`Content size: ${maxX - minX + 1} x ${maxY - minY + 1}`);
  
  if (!hasPixels) {
    console.error('No non-transparent pixels found!');
    return;
  }
  
  // Extract content bbox with small padding
  const padW = Math.floor((maxX - minX) * 0.05);
  const padH = Math.floor((maxY - minY) * 0.05);
  const left = Math.max(0, minX - padW);
  const top = Math.max(0, minY - padH);
  const width = Math.min(info.width - left, (maxX - minX + 1) + padW * 2);
  const height = Math.min(info.height - top, (maxY - minY + 1) + padH * 2);
  
  console.log(`Extracting: left=${left}, top=${top}, ${width}x${height}`);
  
  // Generate square cropped version (center-cropped to content)
  const squareSize = Math.max(width, height);
  const squareLeft = Math.max(0, left + Math.floor((width - squareSize) / 2));
  const squareTop = Math.max(0, top + Math.floor((height - squareSize) / 2));
  
  // Produce variants
  const variants = [
    { name: 'ohho-logo.png', size: 512, square: true },
    { name: 'ohho-logo-sm.png', size: 128, square: true },
    { name: 'ohho-logo-full.png', size: 1024, square: false }, // keep aspect for full
  ];
  
  for (const v of variants) {
    let pipeline = sharp(SRC);
    if (v.square) {
      pipeline = pipeline.extract({
        left: squareLeft,
        top: squareTop,
        width: Math.min(squareSize, info.width - squareLeft),
        height: Math.min(squareSize, info.height - squareTop),
      }).resize(v.size, v.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
    } else {
      pipeline = pipeline.extract({ left, top, width, height })
        .resize({ width: v.size, fit: 'inside' });
    }
    const outPath = `${OUT_DIR}/${v.name}`;
    await pipeline.png({ quality: 90, compressionLevel: 9 }).toFile(outPath);
    const stat = fs.statSync(outPath);
    console.log(`✓ ${v.name}: ${(stat.size / 1024).toFixed(0)} KB`);
  }
  
  // Also produce a favicon
  await sharp(SRC)
    .extract({
      left: squareLeft,
      top: squareTop,
      width: Math.min(squareSize, info.width - squareLeft),
      height: Math.min(squareSize, info.height - squareTop),
    })
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(`${OUT_DIR}/favicon.png`);
  console.log('✓ favicon.png');
  
  // Also create an .ico-style 64px
  await sharp(SRC)
    .extract({
      left: squareLeft,
      top: squareTop,
      width: Math.min(squareSize, info.width - squareLeft),
      height: Math.min(squareSize, info.height - squareTop),
    })
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(`${OUT_DIR}/ohho-logo-64.png`);
  console.log('✓ ohho-logo-64.png');
}

main().catch(e => { console.error(e); process.exit(1); });

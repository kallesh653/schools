/**
 * Generates placeholder PNG assets for Expo app
 * Run: node generate-assets.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function makePNG(width, height, bgR, bgG, bgB, textLines) {
  // Build raw RGBA row data
  const rowSize = width * 4; // RGBA
  const rawData = Buffer.alloc((rowSize + 1) * height, 0);

  // Fill background
  for (let y = 0; y < height; y++) {
    rawData[y * (rowSize + 1)] = 0; // filter type None
    for (let x = 0; x < width; x++) {
      const off = y * (rowSize + 1) + 1 + x * 4;
      rawData[off]     = bgR;
      rawData[off + 1] = bgG;
      rawData[off + 2] = bgB;
      rawData[off + 3] = 255; // alpha
    }
  }

  // Simple pixel font for letters (5x7 bitmap)
  const font = {
    'S': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
    'M': [[1,0,1],[1,1,1],[1,0,1],[1,0,1],[1,0,1]],
    'S2':[[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
  };

  // Draw school logo text "SMS" in center (simplified dots)
  function drawBlock(cx, cy, size, r, g, b) {
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const px = cx + dx;
        const py = cy + dy;
        if (px >= 0 && px < width && py >= 0 && py < height) {
          const off = py * (rowSize + 1) + 1 + px * 4;
          rawData[off]     = r;
          rawData[off + 1] = g;
          rawData[off + 2] = b;
          rawData[off + 3] = 255;
        }
      }
    }
  }

  // Draw a circle
  function drawCircle(cx, cy, radius, r, g, b) {
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        if (x*x + y*y <= radius*radius) {
          const px = cx + x;
          const py = cy + y;
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const off = py * (rowSize + 1) + 1 + px * 4;
            rawData[off]     = r;
            rawData[off + 1] = g;
            rawData[off + 2] = b;
            rawData[off + 3] = 255;
          }
        }
      }
    }
  }

  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);
  const r = Math.floor(width * 0.35);

  // Outer white circle
  drawCircle(cx, cy, r, 255, 255, 255);
  // Inner blue circle
  drawCircle(cx, cy, Math.floor(r * 0.88), bgR, bgG, bgB);

  // Draw "S" letter in white at center
  const letterSize = Math.floor(width * 0.12);
  const letterX = cx - Math.floor(letterSize * 0.7);
  const letterY = cy - Math.floor(letterSize * 1.2);

  // S shape using blocks
  const bs = Math.floor(letterSize / 3);
  // Top bar
  drawBlock(letterX, letterY, letterSize, 255, 255, 255);
  // Middle bar
  drawBlock(letterX, letterY + Math.floor(letterSize * 1.1), letterSize, 255, 255, 255);
  // Bottom bar
  drawBlock(letterX, letterY + Math.floor(letterSize * 2.2), letterSize, 255, 255, 255);
  // Top-left bar
  drawBlock(letterX - bs, letterY + bs, bs, 255, 255, 255);
  // Bottom-right bar
  drawBlock(letterX + letterSize, letterY + Math.floor(letterSize * 1.1) + bs, bs, 255, 255, 255);

  // Compress
  const compressed = zlib.deflateSync(rawData, { level: 9 });

  // Build PNG chunks
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeB = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.concat([typeB, data]);
    const crc = crc32(crcBuf);
    const crcB = Buffer.alloc(4);
    crcB.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([len, typeB, data, crcB]);
  }

  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdrData),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Create assets directory
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

// Navy blue: #1565C0 = 21, 101, 192
const [bgR, bgG, bgB] = [21, 101, 192];

console.log('Generating assets...');

// Icon 1024x1024
const icon = makePNG(1024, 1024, bgR, bgG, bgB);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon);
console.log('✓ assets/icon.png');

// Adaptive icon 1024x1024
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), icon);
console.log('✓ assets/adaptive-icon.png');

// Splash 1080x1920
const splash = makePNG(1080, 1920, bgR, bgG, bgB);
fs.writeFileSync(path.join(assetsDir, 'splash.png'), splash);
console.log('✓ assets/splash.png');

// Favicon 48x48 (for web)
const favicon = makePNG(48, 48, bgR, bgG, bgB);
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), favicon);
console.log('✓ assets/favicon.png');

console.log('\nDone! Assets created in assets/');

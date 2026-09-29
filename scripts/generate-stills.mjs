/**
 * Generates simple still images for the four tour stops (no-WebGL fallback).
 */
import { writeFileSync, mkdirSync } from "fs";
import { deflateSync } from "zlib";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../public/stills");

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function writePng(path, width, height, rgbaFn) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b] = rgbaFn(x / width, y / height);
      const i = row + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mix(c1, c2, t) {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
  ];
}

const scenes = {
  eksterior: (u, v) => {
    const sky = mix([168, 186, 196], [232, 224, 210], Math.min(1, v * 1.4));
    if (v > 0.62) return mix([122, 138, 110], [90, 104, 82], (v - 0.62) / 0.38);
    if (v > 0.38 && u > 0.22 && u < 0.78) {
      const facade = mix([228, 222, 212], [180, 170, 155], (v - 0.38) / 0.24);
      if (u > 0.4 && u < 0.58 && v > 0.45 && v < 0.62) return [140, 168, 172];
      return facade;
    }
    return sky;
  },
  "ruang-tamu": (u, v) => {
    if (v > 0.7) return mix([120, 98, 78], [90, 72, 58], (v - 0.7) / 0.3);
    const wall = mix([236, 230, 220], [210, 202, 188], v);
    if (u > 0.25 && u < 0.55 && v > 0.45 && v < 0.72) return [210, 200, 188];
    if (u > 0.58 && u < 0.72 && v > 0.55 && v < 0.7) return [80, 62, 52];
    return wall;
  },
  kamar: (u, v) => {
    if (v > 0.68) return mix([130, 108, 88], [100, 82, 66], (v - 0.68) / 0.32);
    const wall = mix([232, 226, 218], [200, 192, 180], v * 0.8);
    if (u > 0.3 && u < 0.7 && v > 0.42 && v < 0.7) return [220, 212, 200];
    if (u > 0.28 && u < 0.72 && v > 0.35 && v < 0.45) return [70, 55, 48];
    return wall;
  },
  dek: (u, v) => {
    const sky = mix([150, 175, 180], [210, 220, 214], Math.min(1, v * 1.2));
    if (v > 0.55 && v < 0.78) return mix([150, 130, 108], [120, 104, 88], (v - 0.55) / 0.23);
    if (v >= 0.78) return mix([90, 130, 125], [70, 110, 105], (v - 0.78) / 0.22);
    if (u > 0.15 && u < 0.4 && v > 0.48 && v < 0.58) return [210, 200, 188];
    return sky;
  },
};

mkdirSync(outDir, { recursive: true });
for (const [name, fn] of Object.entries(scenes)) {
  const path = join(outDir, `${name}.png`);
  writePng(path, 1280, 720, fn);
  console.log(`Wrote ${path}`);
}

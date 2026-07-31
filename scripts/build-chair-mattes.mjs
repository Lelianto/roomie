/**
 * Builds the chair-occlusion mattes used by `.scene-chair-mask`.
 *
 * Overlays paint above the scene photo, so the photo is re-drawn on top of them
 * and masked down to the chair silhouette. The silhouette is recovered from the
 * bare render itself: above the tabletop line the chair is the only dark thing
 * in front of a light wall.
 *
 * Run with: node scripts/build-chair-mattes.mjs
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { deflateSync, inflateSync } from "node:zlib";

/** Horizontal window that contains the chair back in each bare render. */
const chairWindows = {
  "compact-ergonomic": [0.392, 0.534],
  "compact-focus": [0.398, 0.523],
  "wide-ergonomic": [0.334, 0.475],
  "wide-focus": [0.378, 0.515],
  "oak-ergonomic": [0.364, 0.469],
  "oak-focus": [0.371, 0.47],
};

/** Vertical window: below the wall art, down to just past the tabletop line. */
const TOP = 0.26;
const BOTTOM = 0.53;
/** Luminance below this is chair (mesh) rather than wall. */
const DARK = 120;
/** Matte resolution — it is scaled to the frame, so it can stay small. */
const OUT_W = 480;
const OUT_H = 320;

const PAD = 0.035;
const TMP = "/tmp/roomie-mattes";
const OUT_DIR = "public/scene/masks";

function decodePng(file) {
  const buf = readFileSync(file);
  let width = 0;
  let height = 0;
  const idat = [];

  for (let o = 8; o < buf.length; ) {
    const len = buf.readUInt32BE(o);
    const type = buf.toString("ascii", o + 4, o + 8);

    if (type === "IHDR") {
      width = buf.readUInt32BE(o + 8);
      height = buf.readUInt32BE(o + 12);
      if (buf[o + 16] !== 8 || buf[o + 17] !== 2 || buf[o + 20] !== 0) {
        throw new Error("expected 8-bit non-interlaced RGB");
      }
    } else if (type === "IDAT") {
      idat.push(buf.subarray(o + 8, o + 8 + len));
    }

    o += 12 + len;
  }

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * 3;
  const px = Buffer.alloc(height * stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));

    for (let i = 0; i < stride; i++) {
      const a = i >= 3 ? px[y * stride + i - 3] : 0;
      const b = y > 0 ? px[(y - 1) * stride + i] : 0;
      const c = i >= 3 && y > 0 ? px[(y - 1) * stride + i - 3] : 0;
      let value = line[i];

      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }

      px[y * stride + i] = value & 0xff;
    }
  }

  return { width, height, stride, px };
}

function crc32(buf) {
  let c = ~0;
  for (const byte of buf) {
    c ^= byte;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, body) {
  const head = Buffer.alloc(4);
  head.writeUInt32BE(body.length);
  const tagged = Buffer.concat([Buffer.from(type, "ascii"), body]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(tagged));
  return Buffer.concat([head, tagged, crc]);
}

/** Writes an 8-bit greyscale PNG — white is chair, black is see-through. */
function encodeGrey(width, height, grey) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 0;

  const raw = Buffer.alloc(height * (width + 1));
  for (let y = 0; y < height; y++) {
    grey.copy(raw, y * (width + 1) + 1, y * width, (y + 1) * width);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync(TMP, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

for (const [key, [left, right]] of Object.entries(chairWindows)) {
  const png = `${TMP}/${key}.png`;
  execFileSync("sips", [
    "-s",
    "format",
    "png",
    `public/scene/renders/${key}.webp`,
    "--out",
    png,
  ]);

  const { width, height, stride, px } = decodePng(png);
  const grey = Buffer.alloc(OUT_W * OUT_H);

  const x0 = Math.max(0, Math.floor((left - PAD) * OUT_W));
  const x1 = Math.min(OUT_W, Math.ceil((right + PAD) * OUT_W));
  const y0 = Math.floor(TOP * OUT_H);
  const y1 = Math.ceil(BOTTOM * OUT_H);

  for (let oy = y0; oy < y1; oy++) {
    const sy0 = Math.floor((oy * height) / OUT_H);
    const sy1 = Math.max(sy0 + 1, Math.floor(((oy + 1) * height) / OUT_H));

    for (let ox = x0; ox < x1; ox++) {
      const sx0 = Math.floor((ox * width) / OUT_W);
      const sx1 = Math.max(sx0 + 1, Math.floor(((ox + 1) * width) / OUT_W));
      let dark = 0;
      let total = 0;

      for (let sy = sy0; sy < sy1; sy++) {
        for (let sx = sx0; sx < sx1; sx++) {
          const i = sy * stride + sx * 3;
          const l = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
          total++;
          if (l < DARK) dark++;
        }
      }

      grey[oy * OUT_W + ox] = Math.round((dark / total) * 255);
    }
  }

  const out = `${OUT_DIR}/${key}.png`;
  writeFileSync(out, encodeGrey(OUT_W, OUT_H, grey));
  console.log(out, readFileSync(out).length, "bytes");
}

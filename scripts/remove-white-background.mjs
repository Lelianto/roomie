import { mkdir, readdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

const sourceDir = new URL("../public/products/", import.meta.url);
const outputDir = new URL("../public/products/cutouts/", import.meta.url);

await mkdir(outputDir, { recursive: true });

const files = (await readdir(sourceDir)).filter((file) => file.endsWith(".jpg"));

for (const file of files) {
  const input = join(sourceDir.pathname, file);
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const pixels = width * height;
  const background = new Uint8Array(pixels);
  const queue = new Int32Array(pixels);
  let head = 0;
  let tail = 0;

  function isBackground(index) {
    const offset = index * channels;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const brightest = Math.max(red, green, blue);
    const darkest = Math.min(red, green, blue);
    const brightness = (red + green + blue) / 3;
    return brightness > 223 && brightest - darkest < 34;
  }

  function add(index) {
    if (background[index] || !isBackground(index)) return;
    background[index] = 1;
    queue[tail++] = index;
  }

  for (let x = 0; x < width; x += 1) {
    add(x);
    add((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    add(y * width);
    add(y * width + width - 1);
  }

  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) add(index - 1);
    if (x < width - 1) add(index + 1);
    if (y > 0) add(index - width);
    if (y < height - 1) add(index + width);
  }

  for (let index = 0; index < pixels; index += 1) {
    const offset = index * channels;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const brightest = Math.max(red, green, blue);
    const darkest = Math.min(red, green, blue);
    const brightness = (red + green + blue) / 3;
    const isPureStudioWhite = brightness > 244 && brightest - darkest < 18;
    if (background[index] || isPureStudioWhite) data[offset + 3] = 0;
  }

  const outputName = `${basename(file, extname(file))}.png`;
  await sharp(data, { raw: { width, height, channels } })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 18,
      right: 18,
      bottom: 18,
      left: 18,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, palette: false })
    .toFile(join(outputDir.pathname, outputName));
}

console.log(`Created ${files.length} transparent product cutouts.`);

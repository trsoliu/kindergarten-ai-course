import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const html = readFileSync(join(repoRoot, "index.html"), "utf8");

const expectedBrands = ["豆包", "小爱同学", "小艺"];

const badges = [...html.matchAll(/<div class="([^"]*\bbrand-badge\b[^"]*)">([\s\S]*?)<\/div>/g)].map((match) => ({
  className: match[1],
  content: match[2],
}));
const failures = [];

function imageSize(assetPath) {
  const output = execFileSync("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "json",
    assetPath,
  ]);
  const [stream] = JSON.parse(output).streams;
  return stream;
}

function visibleBounds(assetPath) {
  const { width, height } = imageSize(assetPath);
  const raw = execFileSync("ffmpeg", [
    "-v",
    "error",
    "-i",
    assetPath,
    "-f",
    "rawvideo",
    "-pix_fmt",
    "rgba",
    "-",
  ]);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const r = raw[offset];
      const g = raw[offset + 1];
      const b = raw[offset + 2];
      const a = raw[offset + 3];
      const isWhiteBackground = r > 245 && g > 245 && b > 245;

      if (a > 24 && !isWhiteBackground) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX === -1) return null;

  return {
    width,
    height,
    centerOffsetX: (minX + maxX + 1) / 2 - width / 2,
    centerOffsetY: (minY + maxY + 1) / 2 - height / 2,
  };
}

for (const brand of expectedBrands) {
  const badge = badges.find(({ content }) => content.includes(`<span>${brand}</span>`) || content.includes(`alt="${brand}`));

  if (!badge) {
    failures.push(`${brand}: missing brand badge`);
    continue;
  }

  const srcMatch = badge.content.match(/<img\b[^>]*\bsrc="([^"]+)"/);

  if (!srcMatch) {
    failures.push(`${brand}: missing logo image`);
    continue;
  }

  const assetPath = join(repoRoot, srcMatch[1]);

  if (!existsSync(assetPath)) {
    failures.push(`${brand}: logo asset does not exist at ${srcMatch[1]}`);
    continue;
  }

  const bounds = visibleBounds(assetPath);

  if (!bounds) {
    failures.push(`${brand}: logo has no detectable visible content`);
    continue;
  }

  const horizontalTolerance = Math.max(3, bounds.width * 0.015);
  const verticalTolerance = Math.max(3, bounds.height * 0.02);

  if (Math.abs(bounds.centerOffsetX) > horizontalTolerance || Math.abs(bounds.centerOffsetY) > verticalTolerance) {
    failures.push(
      `${brand}: visible logo content is off-center by ${bounds.centerOffsetX.toFixed(1)}px horizontally and ${bounds.centerOffsetY.toFixed(1)}px vertically`,
    );
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("All assistant brand logos are present.");

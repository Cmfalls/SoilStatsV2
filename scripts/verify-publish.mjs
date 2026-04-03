import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const sourceFiles = [
  "index.html",
  "src/App.jsx",
  "src/main.jsx",
  "unified-three-pillars.jsx",
  "pillar1-carbon-pools.jsx",
  "pillar2-economics.jsx",
  "pillar3-water-security.jsx",
];

const requiredAssets = [
  "images/TCU.Whitetext.GreenBGjpg.webp",
  "images/TEILogo.webp",
  "images/hero-before.webp",
  "images/hero-after.webp",
  "images/leaf-water-closeup.webp",
  "images/farmer-feature.webp",
];

let failed = false;

for (const file of sourceFiles) {
  const fullPath = path.join(root, file);
  const content = await readFile(fullPath, "utf8");

  if (content.includes("\uFFFD")) {
    failed = true;
    console.error(`[verify:publish] ${file} contains replacement characters.`);
  }
}

for (const asset of requiredAssets) {
  const fullPath = path.join(root, asset);
  try {
    await access(fullPath);
  } catch {
    failed = true;
    console.error(`[verify:publish] Missing required asset: ${asset}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log("[verify:publish] Asset and source-integrity checks passed.");

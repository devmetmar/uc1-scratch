/**
 * Extract MODULES + CAPSTONE from the Cursor canvas into curriculum.json
 * Optional: set UC1_CANVAS_PATH env to override default canvas location.
 */
const fs = require("fs");
const path = require("path");

const canvasPath =
  process.env.UC1_CANVAS_PATH ||
  path.resolve(
    __dirname,
    "../../../../.cursor/projects/c-Users-yothu-Downloads-tyo-2026-ft-big-data-ai/canvases/uc1-learning-platform.canvas.tsx"
  );
const outPath = path.resolve(__dirname, "../src/data/curriculum.json");

if (!fs.existsSync(canvasPath)) {
  console.error("Canvas not found:", canvasPath);
  console.error(
    "Set UC1_CANVAS_PATH to the .canvas.tsx file, or skip extract (JSON already committed)."
  );
  process.exit(1);
}

const src = fs.readFileSync(canvasPath, "utf8");
const mStart = src.indexOf("const MODULES: ModuleDef[] = ");
const cStart = src.indexOf("const CAPSTONE: Array<{");
const aStart = src.indexOf("const ALL_IDS:");
if (mStart < 0 || cStart < 0 || aStart < 0) throw new Error("markers not found");

const modulesLiteral = src.slice(src.indexOf("[", mStart), cStart).trim();
const modulesCode = modulesLiteral.replace(/;?\s*$/, "");
const capstoneLiteral = src
  .slice(src.indexOf("[", cStart), aStart)
  .trim()
  .replace(/;?\s*$/, "");

const MODULES = eval("(" + modulesCode.replace(/;?\s*$/, "") + ")");
const CAPSTONE = eval("(" + capstoneLiteral.replace(/;?\s*$/, "") + ")");

fs.mkdirSync(path.dirname(outPath), { recursive: true });
const payload = {
  title: "UC1 Learning Platform",
  subtitle:
    "Kurikulum Fundamental Deep Learning + Proyek UC1 (HF Radar Currents) — MMS-2 P3 BMKG",
  cutoff: "Draft Report Issue 3.0 (12/06/2026)",
  modules: MODULES,
  capstone: CAPSTONE,
};
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log(
  "Wrote",
  outPath,
  "modules=",
  MODULES.length,
  "capstone=",
  CAPSTONE.length
);

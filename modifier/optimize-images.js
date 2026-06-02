const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const FORMATS = new Set([".jpg", ".jpeg", ".png", ".webp", ".jfif"]);
const SIZES = (process.env.IMAGE_SIZES || "400,800,1200")
  .split(",")
  .map((size) => Number(size.trim()))
  .filter((size) => Number.isFinite(size) && size > 0);
const QUALITY = Number(process.env.IMAGE_QUALITY || 80);

const INPUT_DIR = path.resolve(process.argv[2] || __dirname);
const OUTPUT_DIR = path.resolve(
  process.argv[3] || path.join(__dirname, "..", "optimized", "modifier")
);

function loadSharp() {
  try {
    return require("sharp");
  } catch (error) {
    const sharedSharp = path.join(
      __dirname,
      "..",
      "working-on-images",
      "node_modules",
      "sharp"
    );

    if (fs.existsSync(sharedSharp)) {
      return require(sharedSharp);
    }

    console.error("Module sharp introuvable.");
    console.error("Lance d'abord: cd working-on-images && npm install");
    process.exit(1);
  }
}

const sharp = loadSharp();

function isInside(childPath, parentPath) {
  const relative = path.relative(parentPath, childPath);
  return relative === "" || (!!relative && !relative.startsWith("..") && !path.isAbsolute(relative));
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(2)} Mo`;
}

async function collectImages(dir, files = []) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (isInside(fullPath, OUTPUT_DIR)) {
      continue;
    }

    if (entry.isDirectory()) {
      await collectImages(fullPath, files);
      continue;
    }

    if (entry.isFile() && FORMATS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

async function processImage(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  const relativeDir = path.relative(INPUT_DIR, path.dirname(filePath));
  const outputBaseDir = path.join(OUTPUT_DIR, relativeDir, fileName);
  const originalSize = (await fsp.stat(filePath)).size;

  await fsp.mkdir(outputBaseDir, { recursive: true });

  for (const size of SIZES) {
    const outputPath = path.join(outputBaseDir, `${size}.webp`);

    await sharp(filePath)
      .rotate()
      .resize({ width: size, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    const optimizedSize = (await fsp.stat(outputPath)).size;
    const reduction = Math.round((1 - optimizedSize / originalSize) * 100);
    console.log(
      `${path.relative(INPUT_DIR, filePath)} -> ${path.relative(
        OUTPUT_DIR,
        outputPath
      )} (${formatBytes(originalSize)} -> ${formatBytes(optimizedSize)}, -${reduction}%)`
    );
  }
}

async function run() {
  if (!SIZES.length) {
    console.error("Aucune taille valide. Exemple: IMAGE_SIZES=600,1200");
    process.exit(1);
  }

  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`Dossier introuvable: ${INPUT_DIR}`);
    process.exit(1);
  }

  const files = await collectImages(INPUT_DIR);

  console.log(`Source: ${INPUT_DIR}`);
  console.log(`Sortie: ${OUTPUT_DIR}`);
  console.log(`Qualite WebP: ${QUALITY}`);
  console.log(`${files.length} image(s) trouvee(s)`);

  if (files.length === 0) {
    return;
  }

  for (const file of files) {
    await processImage(file);
  }

  console.log("Optimisation terminee.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

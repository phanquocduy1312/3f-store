import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.resolve(__dirname, '../public/assets/images');

async function optimizeImages() {
  const files = fs.readdirSync(imagesDir);
  let totalSaved = 0;

  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      const inputPath = path.join(imagesDir, file);
      const stat = fs.statSync(inputPath);
      
      // Optimize files larger than 100KB
      if (stat.size > 100 * 1024) {
        const ext = path.extname(file);
        const basename = path.basename(file, ext);
        const outputPath = path.join(imagesDir, `${basename}.webp`);
        
        console.log(`Optimizing: ${file} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
        try {
          await sharp(inputPath)
            .webp({ quality: 80 })
            .toFile(outputPath);
          
          const newStat = fs.statSync(outputPath);
          const saved = stat.size - newStat.size;
          totalSaved += saved;
          console.log(` -> Success: ${basename}.webp (${(newStat.size / 1024).toFixed(2)} KB). Saved: ${(saved / 1024 / 1024).toFixed(2)} MB`);
        } catch (e) {
          console.error(`Failed to optimize ${file}`, e);
        }
      }
    }
  }
  console.log(`\n🎉 Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
}

optimizeImages();

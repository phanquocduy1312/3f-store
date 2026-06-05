#!/usr/bin/env node
import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, basename, extname } from 'path';

const inputDir = './public/assets/images';
const outputDir = './public/assets/images';

async function convertToWebP(inputPath, outputPath) {
  const fileName = basename(inputPath);
  console.log(`\n🔄 Converting: ${fileName}`);
  
  try {
    const input = sharp(inputPath);
    const metadata = await input.metadata();
    const originalSize = (await input.toBuffer()).length;
    
    console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB (${metadata.width}x${metadata.height})`);
    
    // Convert to WebP with quality 85
    await input
      .webp({ 
        quality: 85,
        effort: 6,
      })
      .toFile(outputPath);
    
    const webpBuffer = await sharp(outputPath).toBuffer();
    const webpSize = webpBuffer.length;
    const reduction = ((1 - webpSize / originalSize) * 100).toFixed(1);
    
    console.log(`   WebP: ${(webpSize / 1024).toFixed(2)} KB`);
    console.log(`   ✅ Reduced by ${reduction}%`);
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Converting PNG images to WebP...\n');
  
  try {
    const files = await readdir(inputDir);
    const pngFiles = files.filter(file => extname(file).toLowerCase() === '.png');
    
    if (pngFiles.length === 0) {
      console.log('No PNG files found.');
      return;
    }
    
    console.log(`Found ${pngFiles.length} PNG file(s)\n`);
    
    let totalOriginal = 0;
    let totalWebP = 0;
    
    for (const file of pngFiles) {
      const inputPath = join(inputDir, file);
      const outputPath = join(outputDir, file.replace('.png', '.webp'));
      
      const originalSize = (await sharp(inputPath).toBuffer()).length;
      await convertToWebP(inputPath, outputPath);
      const webpSize = (await sharp(outputPath).toBuffer()).length;
      
      totalOriginal += originalSize;
      totalWebP += webpSize;
    }
    
    const totalReduction = ((1 - totalWebP / totalOriginal) * 100).toFixed(1);
    
    console.log('\n📊 Summary:');
    console.log(`   Total original: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Total WebP: ${(totalWebP / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   ✅ Total reduction: ${totalReduction}%`);
    console.log('\n✨ Done!\n');
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();

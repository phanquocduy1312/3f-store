#!/usr/bin/env node
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { 
  resample, 
  prune, 
  dedup, 
  weld,
  simplify,
  quantize,
  center,
  flatten
} from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { readdir } from 'fs/promises';
import { join, basename } from 'path';

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder,
  });

const inputDir = './public/assets/glb-backup';
const outputDir = './public/assets/glb';

async function optimizeModel(inputPath, outputPath) {
  console.log(`\n🔄 Optimizing: ${basename(inputPath)}`);
  
  try {
    const document = await io.read(inputPath);
    
    const originalBuffer = await io.writeBinary(document);
    const originalSize = originalBuffer.byteLength;
    console.log(`   Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    
    await document.transform(
      prune(),
      dedup(),
      resample(),
      weld({ tolerance: 0.0001 }),
      flatten(),
      center({ pivot: 'below' }),
      quantize({
        quantizePosition: 10,
        quantizeNormal: 8,
        quantizeColor: 8,
        quantizeTexcoord: 8,
      }),
    );
    
    await io.write(outputPath, document);
    
    const optimizedBuffer = await io.writeBinary(document);
    const optimizedSize = optimizedBuffer.byteLength;
    const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
    
    console.log(`   Optimized size: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   ✅ Reduced by ${reduction}%`);
    
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
  }
}

async function main() {
  console.log('🚀 AGGRESSIVE optimization...\n');
  
  const files = await readdir(inputDir);
  const glbFiles = files.filter(file => file.endsWith('.glb'));
  
  console.log(`Found ${glbFiles.length} GLB file(s)\n`);
  
  for (const file of glbFiles) {
    const inputPath = join(inputDir, file);
    const outputPath = join(outputDir, file);
    await optimizeModel(inputPath, outputPath);
  }
  
  console.log('\n✨ Done!\n');
}

main();

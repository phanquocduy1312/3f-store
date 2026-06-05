#!/usr/bin/env node
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { 
  resample, 
  prune, 
  dedup, 
  draco, 
  quantize,
  textureCompress,
  center,
  flatten
} from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, basename } from 'path';

// Configure I/O with all extensions and Draco support
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule(),
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder,
  });

// Input and output directories
const inputDir = './public/assets/glb';
const outputDir = './public/assets/glb';

async function optimizeModel(inputPath, outputPath) {
  console.log(`\n🔄 Optimizing: ${basename(inputPath)}`);
  
  try {
    // Read the glTF document
    const document = await io.read(inputPath);
    
    // Get file size before optimization
    const originalBuffer = await io.writeBinary(document);
    const originalSize = originalBuffer.byteLength;
    console.log(`   Original size: ${(originalSize / 1024).toFixed(2)} KB`);
    
    // Apply optimization transforms
    await document.transform(
      // Remove unused nodes, textures, or other data
      prune(),
      
      // Remove duplicate vertex or texture data
      dedup(),
      
      // Losslessly resample animation frames
      resample(),
      
      // Flatten scene graph where possible
      flatten(),
      
      // Center the model
      center({ pivot: 'below' }),
      
      // Compress geometry with Draco (high compression)
      draco({
        method: 'edgebreaker',
        encodeSpeed: 5,
        decodeSpeed: 5,
        quantizePosition: 14,
        quantizeNormal: 10,
        quantizeColor: 8,
        quantizeTexcoord: 12,
        quantizeGeneric: 12,
      }),
      
      // Quantize vertex data for smaller file size
      quantize({
        quantizePosition: 14,
        quantizeNormal: 10,
        quantizeColor: 8,
        quantizeTexcoord: 12,
      }),
      
      // Compress textures to WebP (if any)
      textureCompress({
        encoder: sharp,
        targetFormat: 'webp',
        resize: [1024, 1024],
        quality: 90,
      }),
    );
    
    // Write optimized file
    await io.write(outputPath, document);
    
    // Get file size after optimization
    const optimizedBuffer = await io.writeBinary(document);
    const optimizedSize = optimizedBuffer.byteLength;
    const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
    
    console.log(`   Optimized size: ${(optimizedSize / 1024).toFixed(2)} KB`);
    console.log(`   ✅ Reduced by ${reduction}%`);
    
  } catch (error) {
    console.error(`   ❌ Error optimizing ${basename(inputPath)}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting GLB optimization...\n');
  
  try {
    // Get all GLB files
    const files = await readdir(inputDir);
    const glbFiles = files.filter(file => file.endsWith('.glb'));
    
    if (glbFiles.length === 0) {
      console.log('No GLB files found in', inputDir);
      return;
    }
    
    console.log(`Found ${glbFiles.length} GLB file(s) to optimize\n`);
    
    // Optimize each file
    for (const file of glbFiles) {
      const inputPath = join(inputDir, file);
      const outputPath = join(outputDir, file);
      await optimizeModel(inputPath, outputPath);
    }
    
    console.log('\n✨ Optimization complete!\n');
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();

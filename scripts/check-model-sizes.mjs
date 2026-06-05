#!/usr/bin/env node
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getSizeColor(mb) {
  if (mb < 1) return COLORS.green;
  if (mb < 5) return COLORS.yellow;
  return COLORS.red;
}

async function checkModelSizes() {
  const dir = './public/assets/glb';
  
  console.log(`\n${COLORS.cyan}${COLORS.bold}📦 3D Model Size Report${COLORS.reset}\n`);
  console.log(`Directory: ${COLORS.cyan}${dir}${COLORS.reset}\n`);
  
  try {
    const files = await readdir(dir);
    const glbFiles = files.filter(file => file.endsWith('.glb'));
    
    if (glbFiles.length === 0) {
      console.log('No GLB files found.\n');
      return;
    }
    
    let totalSize = 0;
    const fileStats = [];
    
    // Get stats for all files
    for (const file of glbFiles) {
      const filePath = join(dir, file);
      const stats = await stat(filePath);
      fileStats.push({ file, size: stats.size });
      totalSize += stats.size;
    }
    
    // Sort by size descending
    fileStats.sort((a, b) => b.size - a.size);
    
    // Display each file
    console.log('File Name              Size       Status');
    console.log('─'.repeat(50));
    
    for (const { file, size } of fileStats) {
      const sizeMB = size / (1024 * 1024);
      const color = getSizeColor(sizeMB);
      const status = sizeMB < 1 ? '✓ Good' : sizeMB < 5 ? '⚠ Large' : '✗ Very Large';
      const paddedName = file.padEnd(20);
      const formattedSize = formatBytes(size).padEnd(10);
      
      console.log(`${paddedName} ${color}${formattedSize}${COLORS.reset} ${status}`);
    }
    
    console.log('─'.repeat(50));
    console.log(`${COLORS.bold}Total:${COLORS.reset} ${formatBytes(totalSize)} (${glbFiles.length} files)\n`);
    
    // Recommendations
    const avgSize = totalSize / glbFiles.length;
    const avgMB = avgSize / (1024 * 1024);
    
    console.log(`${COLORS.cyan}${COLORS.bold}💡 Recommendations:${COLORS.reset}\n`);
    
    if (avgMB > 5) {
      console.log(`${COLORS.yellow}⚠${COLORS.reset}  Average file size is large (${formatBytes(avgSize)})`);
      console.log('   Consider running: npm run optimize:models\n');
    } else if (avgMB > 2) {
      console.log(`${COLORS.yellow}⚠${COLORS.reset}  Models could be optimized further`);
      console.log('   Run: npm run optimize:models\n');
    } else {
      console.log(`${COLORS.green}✓${COLORS.reset}  Models are well optimized!\n`);
    }
    
    // Performance tips
    if (totalSize > 20 * 1024 * 1024) {
      console.log(`${COLORS.cyan}Performance Tips:${COLORS.reset}`);
      console.log('  • Reduce polygon count in 3D software');
      console.log('  • Compress textures to WebP/KTX2');
      console.log('  • Implement Level of Detail (LOD)');
      console.log('  • Use lazy loading (already implemented ✓)');
      console.log('  • Enable Draco compression (already configured ✓)\n');
    }
    
  } catch (error) {
    console.error(`${COLORS.red}Error:${COLORS.reset}`, error.message);
    process.exit(1);
  }
}

checkModelSizes();

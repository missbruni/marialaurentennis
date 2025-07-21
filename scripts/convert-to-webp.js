#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');

// Images to convert to WebP
const IMAGES_TO_CONVERT = [
  'tennis-hero-3.jpeg',
  'tennis-hero-3-optimized.jpeg',
  'tennis-hero.jpg',
  'tennis-hero1.jpg',
  'tennis-ball.png',
  'tennis-ball-small.png',
  'tennis-ball-original.png'
];

async function convertToWebP(inputPath, outputPath, quality = 80) {
  try {
    await sharp(inputPath).webp({ quality }).toFile(outputPath);

    const inputStats = fs.statSync(inputPath);
    const outputStats = fs.statSync(outputPath);

    const inputSize = (inputStats.size / 1024 / 1024).toFixed(2);
    const outputSize = (outputStats.size / 1024 / 1024).toFixed(2);
    const savings = (((inputStats.size - outputStats.size) / inputStats.size) * 100).toFixed(1);

    console.log(`✅ Converted ${path.basename(inputPath)} to WebP`);
    console.log(`   Original: ${inputSize} MB → WebP: ${outputSize} MB (${savings}% smaller)`);

    return true;
  } catch (error) {
    console.error(`❌ Failed to convert ${path.basename(inputPath)}:`, error.message);
    return false;
  }
}

async function convertAllImages() {
  console.log('🔄 Converting images to WebP format...\n');

  let successCount = 0;
  let totalCount = IMAGES_TO_CONVERT.length;

  for (const filename of IMAGES_TO_CONVERT) {
    const inputPath = path.join(PUBLIC_DIR, filename);
    const outputPath = path.join(PUBLIC_DIR, filename.replace(/\.(jpeg|jpg|png)$/, '.webp'));

    if (fs.existsSync(inputPath)) {
      const success = await convertToWebP(inputPath, outputPath);
      if (success) successCount++;
    } else {
      console.log(`⚠️  Skipping ${filename} - file not found`);
    }
  }

  console.log(`\n📊 Conversion complete: ${successCount}/${totalCount} images converted`);

  if (successCount > 0) {
    console.log(
      '\n🎉 WebP images are ready! The OptimizedHeroImage component will now use them automatically.'
    );
  }
}

if (require.main === module) {
  convertAllImages().catch(console.error);
}

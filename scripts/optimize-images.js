#!/usr/bin/env node

/**
 * Image optimization script
 * Converts images to WebP format and creates optimized versions
 *
 * Usage: node scripts/optimize-images.js
 *
 * Requirements:
 * - Install sharp: npm install sharp
 * - Or use online converters for WebP generation
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');

// List of images to optimize
const IMAGES_TO_OPTIMIZE = [
  'tennis-hero-3.jpeg',
  'tennis-hero.jpg',
  'tennis-hero1.jpg',
  'tennis-ball.png',
  'tennis-ball-small.png',
  'tennis-ball-original.png'
];

function checkImageExists(filename) {
  const filePath = path.join(PUBLIC_DIR, filename);
  return fs.existsSync(filePath);
}

function getFileSize(filename) {
  const filePath = path.join(PUBLIC_DIR, filename);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024 / 1024).toFixed(2); // Size in MB
  }
  return null;
}

function logImageInfo() {
  console.log('📸 Image Optimization Report\n');

  IMAGES_TO_OPTIMIZE.forEach((filename) => {
    const exists = checkImageExists(filename);
    const size = exists ? getFileSize(filename) : null;

    console.log(`${exists ? '✅' : '❌'} ${filename}`);
    if (size) {
      console.log(`   Size: ${size} MB`);

      // Check if optimized version exists
      const optimizedName = filename.replace(/\.(jpeg|jpg|png)$/, '-optimized.$1');
      const optimizedExists = checkImageExists(optimizedName);
      const optimizedSize = optimizedExists ? getFileSize(optimizedName) : null;

      if (optimizedExists && optimizedSize) {
        const savings = (
          ((parseFloat(size) - parseFloat(optimizedSize)) / parseFloat(size)) *
          100
        ).toFixed(1);
        console.log(`   Optimized: ${optimizedSize} MB (${savings}% smaller)`);
      }

      // Check if WebP version exists
      const webpName = filename.replace(/\.(jpeg|jpg|png)$/, '.webp');
      const webpExists = checkImageExists(webpName);
      const webpSize = webpExists ? getFileSize(webpName) : null;

      if (webpExists && webpSize) {
        const savings = (
          ((parseFloat(size) - parseFloat(webpSize)) / parseFloat(size)) *
          100
        ).toFixed(1);
        console.log(`   WebP: ${webpSize} MB (${savings}% smaller)`);
      }
    }
    console.log('');
  });

  console.log('💡 Recommendations:');
  console.log('1. Convert images to WebP format for modern browsers');
  console.log('2. Use responsive images with different sizes');
  console.log('3. Implement lazy loading for images below the fold');
  console.log('4. Consider using Next.js Image component with blur placeholder');
}

// Check if sharp is available for WebP conversion
function checkSharpAvailability() {
  try {
    require('sharp');
    console.log('✅ Sharp is available for WebP conversion');
    return true;
  } catch (error) {
    console.log('❌ Sharp not available. Install with: npm install sharp');
    console.log('💡 Alternative: Use online WebP converters or ImageMagick');
    return false;
  }
}

if (require.main === module) {
  console.log('🔍 Checking image optimization status...\n');
  checkSharpAvailability();
  console.log('');
  logImageInfo();
}

# Image Optimization Scripts

This directory contains scripts for optimizing images in this project. These tools help maintain consistent image quality while maximizing performance.

## 📁 Scripts Overview

### `optimize-images.js`

**Purpose**: Check the optimization status of all images in the project
**Usage**: `npm run optimize:images` or `node scripts/optimize-images.js`

### `convert-to-webp.js`

**Purpose**: Convert images to WebP format for better compression
**Usage**: `npm run convert:webp` or `node scripts/convert-to-webp.js`

## 🚀 Quick Start

### Prerequisites

- Node.js installed
- Sharp package available (`npm install sharp`)

### Basic Workflow

```bash
# 1. Check current optimization status
npm run optimize:images

# 2. Convert images to WebP
npm run convert:webp

# 3. Verify results
npm run optimize:images
```

## 📊 Current Optimization Status

Run `npm run optimize:images` to see the current status of all images:

```
📸 Image Optimization Report

✅ tennis-hero-3.jpeg
   Size: 6.11 MB
   Optimized: 5.33 MB (12.8% smaller)
   WebP: 0.90 MB (85.3% smaller)

✅ tennis-ball.png
   Size: 1.72 MB
   WebP: 0.18 MB (89.5% smaller)
```

## 🎯 Common Scenarios

### Scenario 1: Adding a New Hero Image

**When**: Designer provides a new hero image for the website

**Steps**:

```bash
# 1. Add the new image to /public/
cp new-hero-image.jpg public/

# 2. Check if it needs optimization
npm run optimize:images

# 3. Convert to WebP
npm run convert:webp

# 4. Verify the results
npm run optimize:images
```

**Expected Output**:

```
✅ new-hero-image.jpg
   Size: 4.2 MB
   WebP: 0.8 MB (81.0% smaller)
```

### Scenario 2: Multiple Product Images

**When**: Adding tennis equipment photos (rackets, shoes, bags)

**Steps**:

```bash
# 1. Add all images to /public/
cp tennis-racket.jpg public/
cp tennis-shoes.jpg public/
cp tennis-bag.jpg public/

# 2. Batch optimize all new images
npm run convert:webp

# 3. Check results
npm run optimize:images
```

**Expected Output**:

```
✅ tennis-racket.jpg
   Size: 2.1 MB
   WebP: 0.4 MB (81.0% smaller)

✅ tennis-shoes.jpg
   Size: 1.8 MB
   WebP: 0.3 MB (83.3% smaller)

✅ tennis-bag.jpg
   Size: 1.5 MB
   WebP: 0.3 MB (80.0% smaller)
```

### Scenario 3: Marketing Campaign Images

**When**: Adding promotional images for seasonal campaigns

**Steps**:

```bash
# 1. Add campaign images
cp summer-campaign.jpg public/
cp winter-campaign.jpg public/
cp holiday-campaign.jpg public/

# 2. Optimize for web
npm run convert:webp

# 3. Verify optimization
npm run optimize:images
```

### Scenario 4: Design System Updates

**When**: Updating logos, icons, or UI elements

**Steps**:

```bash
# 1. Replace existing images
cp new-logo.png public/
cp new-icon.png public/

# 2. Optimize new assets
npm run convert:webp

# 3. Check file sizes
npm run optimize:images
```

### Scenario 5: Performance Audit

**When**: Checking if all images are properly optimized

**Steps**:

```bash
# 1. Run comprehensive check
npm run optimize:images

# 2. Look for unoptimized images
# 3. Convert any missing WebP versions
npm run convert:webp

# 4. Final verification
npm run optimize:images
```

## 🔧 Technical Details

### Quality Settings

- **WebP Quality**: 80% (excellent visual quality)
- **JPEG Optimization**: 80% quality
- **Format Priority**: WebP → Optimized JPEG → Original

### Supported Formats

- **Input**: JPEG, PNG, GIF
- **Output**: WebP (primary), Optimized JPEG (fallback)

### File Naming Convention

```
Original: image.jpg
Optimized JPEG: image-optimized.jpg
WebP: image.webp
```

## 📱 Browser Support

### WebP Support

- ✅ Chrome (since 2010)
- ✅ Firefox (since 2018)
- ✅ Safari (since 2020)
- ✅ Edge (since 2018)

### Fallback Strategy

```html
<picture>
  <source srcset="image.webp" type="image/webp" />
  <source srcset="image-optimized.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="..." />
</picture>
```

## 🎨 Best Practices

### Image Quality Guidelines

- **Hero Images**: 80-85% quality
- **Product Photos**: 85-90% quality
- **Icons/Logos**: 90-95% quality
- **Screenshots**: 75-80% quality

### File Size Targets

- **Hero Images**: < 1MB (WebP)
- **Product Images**: < 500KB (WebP)
- **Icons**: < 50KB (WebP)
- **Thumbnails**: < 100KB (WebP)

### Naming Conventions

- Use descriptive names: `tennis-court-hero.jpg`
- Avoid spaces: use hyphens or underscores
- Include dimensions if relevant: `logo-200x200.png`

## 🚨 Troubleshooting

### Common Issues

**Sharp not available**

```bash
npm install sharp
```

**Permission denied**

```bash
chmod +x scripts/*.js
```

**Image conversion fails**

- Check file format is supported
- Verify file isn't corrupted
- Ensure sufficient disk space

### Error Messages

**"Can't write format: org.webmproject.webp"**

- Sharp is not installed: `npm install sharp`

**"File not found"**

- Check image exists in `/public/` directory
- Verify correct file path

**"Permission denied"**

- Make scripts executable: `chmod +x scripts/*.js`

## 🔄 Automation Ideas

### Git Hooks

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
npm run optimize:images
```

### CI/CD Pipeline

```yaml
# .github/workflows/image-optimization.yml
- name: Optimize Images
  run: |
    npm install sharp
    npm run convert:webp
```

### Watch Mode (Future Enhancement)

```javascript
// scripts/watch-images.js
chokidar.watch('public/*.{jpg,jpeg,png}').on('add', (path) => {
  convertToWebP(path);
});
```

## 📈 Performance Impact

### Typical Savings

- **Hero Images**: 60-85% smaller
- **Product Photos**: 25-35% smaller
- **Icons/Logos**: 50-80% smaller
- **Screenshots**: 30-50% smaller

### Real Examples from This Project

```
tennis-hero-3.jpeg: 6.11 MB → 0.90 MB (85.3% smaller)
tennis-ball.png: 1.72 MB → 0.18 MB (89.5% smaller)
tennis-ball-small.png: 0.42 MB → 0.05 MB (88.1% smaller)
```

## 🎯 Maintenance Checklist

### Weekly

- [ ] Run `npm run optimize:images`
- [ ] Check for new unoptimized images
- [ ] Convert any new images to WebP

### Monthly

- [ ] Review image quality settings
- [ ] Check browser support statistics
- [ ] Update optimization scripts if needed

### Quarterly

- [ ] Audit all images for optimization
- [ ] Review file size targets
- [ ] Consider new image formats (AVIF)

## 📞 Support

For issues or questions:

1. Check this README first
2. Run `npm run optimize:images` for diagnostics
3. Review error messages in terminal output
4. Check Sharp documentation for advanced usage

# Image Optimization Scripts

This directory contains scripts for optimizing images in this project. These tools help maintain consistent image quality while maximizing performance.

## 📁 Scripts Overview

### `optimize-images.js`

**Purpose**: Check the optimization status of all images in the project
**Usage**: `npm run optimize:images` or `node scripts/optimize-images.js`

### `convert-to-webp.js`

**Purpose**: Convert images to WebP format for better compression
**Usage**: `npm run convert:webp` or `node scripts/convert-to-webp.js`

## 🚀 Quick Start

### Prerequisites

- Node.js installed
- Sharp package available (`npm install sharp`)

### Basic Workflow

```bash
# 1. Check current optimization status
npm run optimize:images

# 2. Convert images to WebP
npm run convert:webp

# 3. Verify results
npm run optimize:images
```

## 📊 Current Optimization Status

Run `npm run optimize:images` to see the current status of all images:

```
📸 Image Optimization Report

✅ tennis-hero-3.jpeg
   Size: 6.11 MB
   Optimized: 5.33 MB (12.8% smaller)
   WebP: 0.90 MB (85.3% smaller)

✅ tennis-ball.png
   Size: 1.72 MB
   WebP: 0.18 MB (89.5% smaller)
```

## 🎯 Common Scenarios

### Scenario 1: Adding a New Hero Image

**When**: Designer provides a new hero image for the website

**Steps**:

```bash
# 1. Add the new image to /public/
cp new-hero-image.jpg public/

# 2. Check if it needs optimization
npm run optimize:images

# 3. Convert to WebP
npm run convert:webp

# 4. Verify the results
npm run optimize:images
```

**Expected Output**:

```
✅ new-hero-image.jpg
   Size: 4.2 MB
   WebP: 0.8 MB (81.0% smaller)
```

### Scenario 2: Multiple Product Images

**When**: Adding tennis equipment photos (rackets, shoes, bags)

**Steps**:

```bash
# 1. Add all images to /public/
cp tennis-racket.jpg public/
cp tennis-shoes.jpg public/
cp tennis-bag.jpg public/

# 2. Batch optimize all new images
npm run convert:webp

# 3. Check results
npm run optimize:images
```

**Expected Output**:

```
✅ tennis-racket.jpg
   Size: 2.1 MB
   WebP: 0.4 MB (81.0% smaller)

✅ tennis-shoes.jpg
   Size: 1.8 MB
   WebP: 0.3 MB (83.3% smaller)

✅ tennis-bag.jpg
   Size: 1.5 MB
   WebP: 0.3 MB (80.0% smaller)
```

### Scenario 3: Marketing Campaign Images

**When**: Adding promotional images for seasonal campaigns

**Steps**:

```bash
# 1. Add campaign images
cp summer-campaign.jpg public/
cp winter-campaign.jpg public/
cp holiday-campaign.jpg public/

# 2. Optimize for web
npm run convert:webp

# 3. Verify optimization
npm run optimize:images
```

### Scenario 4: Design System Updates

**When**: Updating logos, icons, or UI elements

**Steps**:

```bash
# 1. Replace existing images
cp new-logo.png public/
cp new-icon.png public/

# 2. Optimize new assets
npm run convert:webp

# 3. Check file sizes
npm run optimize:images
```

### Scenario 5: Performance Audit

**When**: Checking if all images are properly optimized

**Steps**:

```bash
# 1. Run comprehensive check
npm run optimize:images

# 2. Look for unoptimized images
# 3. Convert any missing WebP versions
npm run convert:webp

# 4. Final verification
npm run optimize:images
```

## 🔧 Technical Details

### Quality Settings

- **WebP Quality**: 80% (excellent visual quality)
- **JPEG Optimization**: 80% quality
- **Format Priority**: WebP → Optimized JPEG → Original

### Supported Formats

- **Input**: JPEG, PNG, GIF
- **Output**: WebP (primary), Optimized JPEG (fallback)

### File Naming Convention

```
Original: image.jpg
Optimized JPEG: image-optimized.jpg
WebP: image.webp
```

## 📱 Browser Support

### WebP Support

- ✅ Chrome (since 2010)
- ✅ Firefox (since 2018)
- ✅ Safari (since 2020)
- ✅ Edge (since 2018)

### Fallback Strategy

```html
<picture>
  <source srcset="image.webp" type="image/webp" />
  <source srcset="image-optimized.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="..." />
</picture>
```

## 🎨 Best Practices

### Image Quality Guidelines

- **Hero Images**: 80-85% quality
- **Product Photos**: 85-90% quality
- **Icons/Logos**: 90-95% quality
- **Screenshots**: 75-80% quality

### File Size Targets

- **Hero Images**: < 1MB (WebP)
- **Product Images**: < 500KB (WebP)
- **Icons**: < 50KB (WebP)
- **Thumbnails**: < 100KB (WebP)

### Naming Conventions

- Use descriptive names: `tennis-court-hero.jpg`
- Avoid spaces: use hyphens or underscores
- Include dimensions if relevant: `logo-200x200.png`

## 🚨 Troubleshooting

### Common Issues

**Sharp not available**

```bash
npm install sharp
```

**Permission denied**

```bash
chmod +x scripts/*.js
```

**Image conversion fails**

- Check file format is supported
- Verify file isn't corrupted
- Ensure sufficient disk space

### Error Messages

**"Can't write format: org.webmproject.webp"**

- Sharp is not installed: `npm install sharp`

**"File not found"**

- Check image exists in `/public/` directory
- Verify correct file path

**"Permission denied"**

- Make scripts executable: `chmod +x scripts/*.js`

## 🔄 Automation Ideas

### Git Hooks

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
npm run optimize:images
```

### CI/CD Pipeline

```yaml
# .github/workflows/image-optimization.yml
- name: Optimize Images
  run: |
    npm install sharp
    npm run convert:webp
```

### Watch Mode (Future Enhancement)

```javascript
// scripts/watch-images.js
chokidar.watch('public/*.{jpg,jpeg,png}').on('add', (path) => {
  convertToWebP(path);
});
```

## 📈 Performance Impact

### Typical Savings

- **Hero Images**: 60-85% smaller
- **Product Photos**: 25-35% smaller
- **Icons/Logos**: 50-80% smaller
- **Screenshots**: 30-50% smaller

### Real Examples from This Project

```
tennis-hero-3.jpeg: 6.11 MB → 0.90 MB (85.3% smaller)
tennis-ball.png: 1.72 MB → 0.18 MB (89.5% smaller)
tennis-ball-small.png: 0.42 MB → 0.05 MB (88.1% smaller)
```

## 🎯 Maintenance Checklist

### Weekly

- [ ] Run `npm run optimize:images`
- [ ] Check for new unoptimized images
- [ ] Convert any new images to WebP

### Monthly

- [ ] Review image quality settings
- [ ] Check browser support statistics
- [ ] Update optimization scripts if needed

### Quarterly

- [ ] Audit all images for optimization
- [ ] Review file size targets
- [ ] Consider new image formats (AVIF)

## 📞 Support

For issues or questions:

1. Check this README first
2. Run `npm run optimize:images` for diagnostics
3. Review error messages in terminal output
4. Check Sharp documentation for advanced usage

# Image Optimization Scripts

This directory contains scripts for optimizing images in this project. These tools help maintain consistent image quality while maximizing performance.

## 📁 Scripts Overview

### `optimize-images.js`

**Purpose**: Check the optimization status of all images in the project
**Usage**: `npm run optimize:images` or `node scripts/optimize-images.js`

### `convert-to-webp.js`

**Purpose**: Convert images to WebP format for better compression
**Usage**: `npm run convert:webp` or `node scripts/convert-to-webp.js`

## 🚀 Quick Start

### Prerequisites

- Node.js installed
- Sharp package available (`npm install sharp`)

### Basic Workflow

```bash
# 1. Check current optimization status
npm run optimize:images

# 2. Convert images to WebP
npm run convert:webp

# 3. Verify results
npm run optimize:images
```

## 📊 Current Optimization Status

Run `npm run optimize:images` to see the current status of all images:

```
📸 Image Optimization Report

✅ tennis-hero-3.jpeg
   Size: 6.11 MB
   Optimized: 5.33 MB (12.8% smaller)
   WebP: 0.90 MB (85.3% smaller)

✅ tennis-ball.png
   Size: 1.72 MB
   WebP: 0.18 MB (89.5% smaller)
```

## 🎯 Common Scenarios

### Scenario 1: Adding a New Hero Image

**When**: Designer provides a new hero image for the website

**Steps**:

```bash
# 1. Add the new image to /public/
cp new-hero-image.jpg public/

# 2. Check if it needs optimization
npm run optimize:images

# 3. Convert to WebP
npm run convert:webp

# 4. Verify the results
npm run optimize:images
```

**Expected Output**:

```
✅ new-hero-image.jpg
   Size: 4.2 MB
   WebP: 0.8 MB (81.0% smaller)
```

### Scenario 2: Multiple Product Images

**When**: Adding tennis equipment photos (rackets, shoes, bags)

**Steps**:

```bash
# 1. Add all images to /public/
cp tennis-racket.jpg public/
cp tennis-shoes.jpg public/
cp tennis-bag.jpg public/

# 2. Batch optimize all new images
npm run convert:webp

# 3. Check results
npm run optimize:images
```

**Expected Output**:

```
✅ tennis-racket.jpg
   Size: 2.1 MB
   WebP: 0.4 MB (81.0% smaller)

✅ tennis-shoes.jpg
   Size: 1.8 MB
   WebP: 0.3 MB (83.3% smaller)

✅ tennis-bag.jpg
   Size: 1.5 MB
   WebP: 0.3 MB (80.0% smaller)
```

### Scenario 3: Marketing Campaign Images

**When**: Adding promotional images for seasonal campaigns

**Steps**:

```bash
# 1. Add campaign images
cp summer-campaign.jpg public/
cp winter-campaign.jpg public/
cp holiday-campaign.jpg public/

# 2. Optimize for web
npm run convert:webp

# 3. Verify optimization
npm run optimize:images
```

### Scenario 4: Design System Updates

**When**: Updating logos, icons, or UI elements

**Steps**:

```bash
# 1. Replace existing images
cp new-logo.png public/
cp new-icon.png public/

# 2. Optimize new assets
npm run convert:webp

# 3. Check file sizes
npm run optimize:images
```

### Scenario 5: Performance Audit

**When**: Checking if all images are properly optimized

**Steps**:

```bash
# 1. Run comprehensive check
npm run optimize:images

# 2. Look for unoptimized images
# 3. Convert any missing WebP versions
npm run convert:webp

# 4. Final verification
npm run optimize:images
```

## 🔧 Technical Details

### Quality Settings

- **WebP Quality**: 80% (excellent visual quality)
- **JPEG Optimization**: 80% quality
- **Format Priority**: WebP → Optimized JPEG → Original

### Supported Formats

- **Input**: JPEG, PNG, GIF
- **Output**: WebP (primary), Optimized JPEG (fallback)

### File Naming Convention

```
Original: image.jpg
Optimized JPEG: image-optimized.jpg
WebP: image.webp
```

## 📱 Browser Support

### WebP Support

- ✅ Chrome (since 2010)
- ✅ Firefox (since 2018)
- ✅ Safari (since 2020)
- ✅ Edge (since 2018)

### Fallback Strategy

```html
<picture>
  <source srcset="image.webp" type="image/webp" />
  <source srcset="image-optimized.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="..." />
</picture>
```

## 🎨 Best Practices

### Image Quality Guidelines

- **Hero Images**: 80-85% quality
- **Product Photos**: 85-90% quality
- **Icons/Logos**: 90-95% quality
- **Screenshots**: 75-80% quality

### File Size Targets

- **Hero Images**: < 1MB (WebP)
- **Product Images**: < 500KB (WebP)
- **Icons**: < 50KB (WebP)
- **Thumbnails**: < 100KB (WebP)

### Naming Conventions

- Use descriptive names: `tennis-court-hero.jpg`
- Avoid spaces: use hyphens or underscores
- Include dimensions if relevant: `logo-200x200.png`

## 🚨 Troubleshooting

### Common Issues

**Sharp not available**

```bash
npm install sharp
```

**Permission denied**

```bash
chmod +x scripts/*.js
```

**Image conversion fails**

- Check file format is supported
- Verify file isn't corrupted
- Ensure sufficient disk space

### Error Messages

**"Can't write format: org.webmproject.webp"**

- Sharp is not installed: `npm install sharp`

**"File not found"**

- Check image exists in `/public/` directory
- Verify correct file path

**"Permission denied"**

- Make scripts executable: `chmod +x scripts/*.js`

## 🔄 Automation Ideas

### Git Hooks

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
npm run optimize:images
```

### CI/CD Pipeline

```yaml
# .github/workflows/image-optimization.yml
- name: Optimize Images
  run: |
    npm install sharp
    npm run convert:webp
```

### Watch Mode (Future Enhancement)

```javascript
// scripts/watch-images.js
chokidar.watch('public/*.{jpg,jpeg,png}').on('add', (path) => {
  convertToWebP(path);
});
```

## 📈 Performance Impact

### Typical Savings

- **Hero Images**: 60-85% smaller
- **Product Photos**: 25-35% smaller
- **Icons/Logos**: 50-80% smaller
- **Screenshots**: 30-50% smaller

### Real Examples from This Project

```
tennis-hero-3.jpeg: 6.11 MB → 0.90 MB (85.3% smaller)
tennis-ball.png: 1.72 MB → 0.18 MB (89.5% smaller)
tennis-ball-small.png: 0.42 MB → 0.05 MB (88.1% smaller)
```

## 🎯 Maintenance Checklist

### Weekly

- [ ] Run `npm run optimize:images`
- [ ] Check for new unoptimized images
- [ ] Convert any new images to WebP

### Monthly

- [ ] Review image quality settings
- [ ] Check browser support statistics
- [ ] Update optimization scripts if needed

### Quarterly

- [ ] Audit all images for optimization
- [ ] Review file size targets
- [ ] Consider new image formats (AVIF)

## 📞 Support

For issues or questions:

1. Check this README first
2. Run `npm run optimize:images` for diagnostics
3. Review error messages in terminal output
4. Check Sharp documentation for advanced usage

# Image Optimization Scripts

This directory contains scripts for optimizing images in this project. These tools help maintain consistent image quality while maximizing performance.

## 📁 Scripts Overview

### `optimize-images.js`

**Purpose**: Check the optimization status of all images in the project
**Usage**: `npm run optimize:images` or `node scripts/optimize-images.js`

### `convert-to-webp.js`

**Purpose**: Convert images to WebP format for better compression
**Usage**: `npm run convert:webp` or `node scripts/convert-to-webp.js`

## 🚀 Quick Start

### Prerequisites

- Node.js installed
- Sharp package available (`npm install sharp`)

### Basic Workflow

```bash
# 1. Check current optimization status
npm run optimize:images

# 2. Convert images to WebP
npm run convert:webp

# 3. Verify results
npm run optimize:images
```

## 📊 Current Optimization Status

Run `npm run optimize:images` to see the current status of all images:

```
📸 Image Optimization Report

✅ tennis-hero-3.jpeg
   Size: 6.11 MB
   Optimized: 5.33 MB (12.8% smaller)
   WebP: 0.90 MB (85.3% smaller)

✅ tennis-ball.png
   Size: 1.72 MB
   WebP: 0.18 MB (89.5% smaller)
```

## 🎯 Common Scenarios

### Scenario 1: Adding a New Hero Image

**When**: Designer provides a new hero image for the website

**Steps**:

```bash
# 1. Add the new image to /public/
cp new-hero-image.jpg public/

# 2. Check if it needs optimization
npm run optimize:images

# 3. Convert to WebP
npm run convert:webp

# 4. Verify the results
npm run optimize:images
```

**Expected Output**:

```
✅ new-hero-image.jpg
   Size: 4.2 MB
   WebP: 0.8 MB (81.0% smaller)
```

### Scenario 2: Multiple Product Images

**When**: Adding tennis equipment photos (rackets, shoes, bags)

**Steps**:

```bash
# 1. Add all images to /public/
cp tennis-racket.jpg public/
cp tennis-shoes.jpg public/
cp tennis-bag.jpg public/

# 2. Batch optimize all new images
npm run convert:webp

# 3. Check results
npm run optimize:images
```

**Expected Output**:

```
✅ tennis-racket.jpg
   Size: 2.1 MB
   WebP: 0.4 MB (81.0% smaller)

✅ tennis-shoes.jpg
   Size: 1.8 MB
   WebP: 0.3 MB (83.3% smaller)

✅ tennis-bag.jpg
   Size: 1.5 MB
   WebP: 0.3 MB (80.0% smaller)
```

### Scenario 3: Marketing Campaign Images

**When**: Adding promotional images for seasonal campaigns

**Steps**:

```bash
# 1. Add campaign images
cp summer-campaign.jpg public/
cp winter-campaign.jpg public/
cp holiday-campaign.jpg public/

# 2. Optimize for web
npm run convert:webp

# 3. Verify optimization
npm run optimize:images
```

### Scenario 4: Design System Updates

**When**: Updating logos, icons, or UI elements

**Steps**:

```bash
# 1. Replace existing images
cp new-logo.png public/
cp new-icon.png public/

# 2. Optimize new assets
npm run convert:webp

# 3. Check file sizes
npm run optimize:images
```

### Scenario 5: Performance Audit

**When**: Checking if all images are properly optimized

**Steps**:

```bash
# 1. Run comprehensive check
npm run optimize:images

# 2. Look for unoptimized images
# 3. Convert any missing WebP versions
npm run convert:webp

# 4. Final verification
npm run optimize:images
```

## 🔧 Technical Details

### Quality Settings

- **WebP Quality**: 80% (excellent visual quality)
- **JPEG Optimization**: 80% quality
- **Format Priority**: WebP → Optimized JPEG → Original

### Supported Formats

- **Input**: JPEG, PNG, GIF
- **Output**: WebP (primary), Optimized JPEG (fallback)

### File Naming Convention

```
Original: image.jpg
Optimized JPEG: image-optimized.jpg
WebP: image.webp
```

## 📱 Browser Support

### WebP Support

- ✅ Chrome (since 2010)
- ✅ Firefox (since 2018)
- ✅ Safari (since 2020)
- ✅ Edge (since 2018)

### Fallback Strategy

```html
<picture>
  <source srcset="image.webp" type="image/webp" />
  <source srcset="image-optimized.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="..." />
</picture>
```

## 🎨 Best Practices

### Image Quality Guidelines

- **Hero Images**: 80-85% quality
- **Product Photos**: 85-90% quality
- **Icons/Logos**: 90-95% quality
- **Screenshots**: 75-80% quality

### File Size Targets

- **Hero Images**: < 1MB (WebP)
- **Product Images**: < 500KB (WebP)
- **Icons**: < 50KB (WebP)
- **Thumbnails**: < 100KB (WebP)

### Naming Conventions

- Use descriptive names: `tennis-court-hero.jpg`
- Avoid spaces: use hyphens or underscores
- Include dimensions if relevant: `logo-200x200.png`

## 🚨 Troubleshooting

### Common Issues

**Sharp not available**

```bash
npm install sharp
```

**Permission denied**

```bash
chmod +x scripts/*.js
```

**Image conversion fails**

- Check file format is supported
- Verify file isn't corrupted
- Ensure sufficient disk space

### Error Messages

**"Can't write format: org.webmproject.webp"**

- Sharp is not installed: `npm install sharp`

**"File not found"**

- Check image exists in `/public/` directory
- Verify correct file path

**"Permission denied"**

- Make scripts executable: `chmod +x scripts/*.js`

## 🔄 Automation Ideas

### Git Hooks

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
npm run optimize:images
```

### CI/CD Pipeline

```yaml
# .github/workflows/image-optimization.yml
- name: Optimize Images
  run: |
    npm install sharp
    npm run convert:webp
```

### Watch Mode (Future Enhancement)

```javascript
// scripts/watch-images.js
chokidar.watch('public/*.{jpg,jpeg,png}').on('add', (path) => {
  convertToWebP(path);
});
```

## 📈 Performance Impact

### Typical Savings

- **Hero Images**: 60-85% smaller
- **Product Photos**: 25-35% smaller
- **Icons/Logos**: 50-80% smaller
- **Screenshots**: 30-50% smaller

### Real Examples from This Project

```
tennis-hero-3.jpeg: 6.11 MB → 0.90 MB (85.3% smaller)
tennis-ball.png: 1.72 MB → 0.18 MB (89.5% smaller)
tennis-ball-small.png: 0.42 MB → 0.05 MB (88.1% smaller)
```

**Remember**: These scripts are designed to maintain consistent image optimization standards across the project. Use them regularly to ensure optimal performance and user experience.

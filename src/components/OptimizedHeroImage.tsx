import Image from 'next/image';
import React from 'react';

interface OptimizedHeroImageProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function OptimizedHeroImage({ className, style }: OptimizedHeroImageProps) {
  return (
    <picture className={className} style={style}>
      {/* WebP format for modern browsers - 85% smaller than original */}
      <source srcSet="/tennis-hero-3.webp" type="image/webp" />

      {/* Optimized JPEG as fallback - 12% smaller than original */}
      <source srcSet="/tennis-hero-3-optimized.jpeg" type="image/jpeg" />

      {/* Original JPEG as final fallback */}
      <Image
        src="/tennis-hero-3.jpeg"
        alt="Tennis court background"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-80"
        style={{ objectPosition: 'center' }}
      />
    </picture>
  );
}

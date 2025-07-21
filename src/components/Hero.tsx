import OptimizedHeroImage from './OptimizedHeroImage';
import HeroAnimated from './HeroAnimated';

export default function Hero() {
  return (
    <section className="relative flex h-[calc(100vh-72px)] w-full items-center justify-center bg-white text-white">
      {/* Pre-render the optimized image with WebP support */}
      <div className="absolute inset-0 z-0">
        <OptimizedHeroImage />
      </div>

      <HeroAnimated />
    </section>
  );
}

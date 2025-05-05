import Image from 'next/image';
import HeroAnimated from './HeroAnimated';

export default function Hero() {
  return (
    <section className="relative h-[calc(100vh-72px)] w-full flex items-center justify-center text-white bg-white">
      {/* Pre-render the image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/tennis-hero-3.jpeg"
          alt="Tennis court background"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80"
          style={{ objectPosition: 'center' }}
        />
      </div>

      <HeroAnimated />
    </section>
  );
}

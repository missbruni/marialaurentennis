import React from 'react';
import AnimatedLogo from './AnimatedLogo';
import { useSectionRef } from '@/hooks/useSectionRef';
import { Button } from './ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const HeroAnimated: React.FC = () => {
  const { scrollToBookingForm } = useSectionRef();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const logoWidth = isMobile ? 280 : isTablet ? 400 : 500;

  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 z-0"></div>
      <div className="relative z-10 text-center mx-auto flex items-center justify-center flex-col">
        <div className="mb-10">
          <AnimatedLogo width={logoWidth} />
        </div>
        <p className="text-lg md:text-xl max-w-sm md:max-w-xl mx-auto mb-6 drop-shadow-md">
          Personalized coaching, convenient scheduling, and world-class support to level up your
          game.
        </p>

        <Button
          className="bg-white text-black font-semibold px-8 py-6 no-border text-lg cursor-pointer"
          onClick={scrollToBookingForm}
          aria-label="Book Lesson"
        >
          Book a Lesson
        </Button>
      </div>
    </>
  );
};
export default HeroAnimated;

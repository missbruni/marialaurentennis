'use client';

import React from 'react';
import AnimatedLogo from './AnimatedLogo';
import { useSectionRef } from '@/hooks/useSectionRef';
import { Button } from './ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const HeroAnimated: React.FC = React.memo(() => {
  const { scrollToBookingForm } = useSectionRef();

  const isMobile = useMediaQuery('(max-width: 768px)');
  const logoWidth = isMobile ? 280 : 400;

  const handleBookLessonClick = React.useCallback(() => {
    scrollToBookingForm();
  }, [scrollToBookingForm]);

  return (
    <>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/10 to-black/30"></div>
      <div className="relative z-10 mx-auto flex flex-col items-center justify-center text-center">
        <div className="mb-10">
          <AnimatedLogo width={logoWidth} />
        </div>
        <p className="mx-auto mb-6 max-w-sm text-lg drop-shadow-md md:max-w-xl md:text-xl">
          Personalized coaching, convenient scheduling, and world-class support to level up your
          game.
        </p>

        <Button
          className="no-border text-md cursor-pointer px-8 py-6 font-semibold"
          onClick={handleBookLessonClick}
          aria-label="Book Lesson"
        >
          Book a Lesson
        </Button>
      </div>
    </>
  );
});

HeroAnimated.displayName = 'HeroAnimated';
export default HeroAnimated;

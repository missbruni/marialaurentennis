'use client';

import Hero from '@/components/Hero';
import BookingForm from '@/components/BookingForm';
import React from 'react';
import ContactForm from '../components/ContactForm';
import { useRouter, useSearchParams } from 'next/navigation';
import SuspenseLoading from '../components/SuspenseLoading';
import { releaseAvailability } from '../services/availabilities';
import { useQueryClient } from '@tanstack/react-query';

function CancellationHandler() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const releaseLessonId = searchParams.get('releaseLesson');

  React.useEffect(() => {
    if (releaseLessonId) {
      (async () => {
        await releaseAvailability(releaseLessonId);
        queryClient.invalidateQueries({ queryKey: ['availabilities'] });
        router.replace('/');
      })();
    }
  }, [releaseLessonId, router]);

  return null;
}

export default function HomePage() {
  return (
    <main className="relative w-full flex flex-col items-center justify-start">
      <SuspenseLoading>
        <CancellationHandler />
      </SuspenseLoading>

      <Hero />
      <div className="bg-background flex items-center w-full">
        <BookingForm />
      </div>
      <div className="w-full">
        <ContactForm />
      </div>
    </main>
  );
}

import React from 'react';
import { useSearchParams } from 'next/navigation';
import type { Availability } from '@/services/availabilities';

export function useLessonFromParams() {
  const searchParams = useSearchParams();
  const lessonParam = searchParams.get('lesson');

  return React.useMemo(() => {
    if (!lessonParam) return null;

    try {
      const decodedLesson = Buffer.from(decodeURIComponent(lessonParam), 'base64').toString();
      return JSON.parse(decodedLesson) as Availability;
    } catch (error) {
      console.error('Failed to parse booking details:', error);
      return null;
    }
  }, [lessonParam]);
}

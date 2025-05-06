import React from 'react';
import { useRouter } from 'next/navigation';

import { useSearchParams } from 'next/navigation';
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
  }, [releaseLessonId, router, queryClient]);

  return null;
}

export default CancellationHandler;

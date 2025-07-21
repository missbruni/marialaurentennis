import React from 'react';
import { useTrail, animated } from '@react-spring/web';
import { format, isAfter, isEqual, isToday } from 'date-fns';
import { Availability } from '../services/availabilities';
import Lesson from './Lesson';
import { Typography } from './ui/typography';
import Loader from './Loader';
import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircleIcon } from 'lucide-react';

type AvailableLessonsProps = {
  availableLessons: Availability[];
  date: string;
  nextAvailableSlot: Date | null;
};

const AvailableLessons: React.FC<AvailableLessonsProps> = React.memo(
  ({ date, availableLessons, nextAvailableSlot }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedLessonId, setSelectedLessonId] = React.useState<string | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const prevDateRef = React.useRef(date);

    const filteredLessons = React.useMemo(() => {
      if (!nextAvailableSlot || !isToday(nextAvailableSlot)) return availableLessons;

      const now = new Date();
      return availableLessons.filter((lesson) => {
        const lessonStartTime = lesson.startDateTime.toDate();
        return isAfter(lessonStartTime, now) || isEqual(lessonStartTime, now);
      });
    }, [availableLessons, nextAvailableSlot]);

    const trail = useTrail(filteredLessons.length, {
      from: { opacity: 0, transform: 'translateY(-24px) scale(0.96)' },
      to: { opacity: 1, transform: 'translateY(0px) scale(1)' },
      config: { mass: 1, tension: 220, friction: 24 },
      reset: prevDateRef.current !== date
    });

    React.useEffect(() => {
      prevDateRef.current = date;
    }, [date]);

    if (!date) return null;

    // Memoize the checkout handler to prevent unnecessary re-renders
    const handleCheckout = React.useCallback(
      async (lesson: Availability) => {
        setIsLoading(true);
        setErrorMessage(null);
        setSelectedLessonId(lesson.id);

        try {
          const res = await fetch('/api/create-checkout-session', {
            method: 'POST',
            body: JSON.stringify({ lesson, userId: user?.uid, userEmail: user?.email })
          });

          const data = await res.json();
          if (data.url) {
            setTimeout(() => {
              window.location.href = data.url;
            }, 500);
          } else {
            setErrorMessage(data.error);
          }
        } catch {
          setErrorMessage('Sorry, there was a problem starting your checkout. Please try again.');
        } finally {
          queryClient.invalidateQueries({ queryKey: ['availabilities'] });
          setIsLoading(false);
          setSelectedLessonId(null);
        }
      },
      [user?.uid, user?.email, queryClient]
    );

    return (
      <div className="@container relative">
        <Typography.H4 className="text-foreground my-6 text-center md:text-left md:text-2xl">
          <span className="text-tennis-green font-bold">Availability</span> on{' '}
          {format(date, 'EEEE MMMM d')}
        </Typography.H4>

        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Lesson no longer available</AlertTitle>
            <AlertDescription>Looks like someone else beat you to it.</AlertDescription>
          </Alert>
        )}

        <div className="mx-auto grid max-w-[570px] grid-cols-1 gap-3 md:mx-0 @[500px]:grid-cols-2">
          {trail.map((style, index) => (
            <animated.div
              key={filteredLessons[index].id}
              style={style}
              className="mx-auto w-full max-w-[300px] md:mx-0 lg:max-w-[280px]"
            >
              <Lesson
                lesson={filteredLessons[index]}
                isLoading={isLoading}
                onLessonSelected={handleCheckout}
                selectedLessonId={selectedLessonId}
              />
            </animated.div>
          ))}
        </div>

        {isLoading && <Loader message="Preparing your checkout..." />}
      </div>
    );
  }
);

AvailableLessons.displayName = 'AvailableLessons';
export default AvailableLessons;

import React from 'react';
import { useTrail, animated } from '@react-spring/web';
import { format } from 'date-fns/format';
import { Availability } from '../services/availabilities';
import Lesson from './Lesson';
import { Typography } from './ui/typography';
import Loader from './Loader';

type AvailableLessonsProps = {
  availableLessons: Availability[];
  date: string;
};

const AvailableLessons: React.FC<AvailableLessonsProps> = ({ availableLessons, date }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedLessonId, setSelectedLessonId] = React.useState<string | null>(null);

  const trail = useTrail(availableLessons.length + 1, {
    from: { opacity: 0, transform: 'translateY(-24px) scale(0.96)' },
    to: { opacity: 1, transform: 'translateY(0px) scale(1)' },
    reset: true,
    config: { mass: 1, tension: 220, friction: 24 },
  }).reverse();

  if (!date) return null;

  const handleCheckout = async (lesson: Availability) => {
    setIsLoading(true);
    setSelectedLessonId(lesson.id);

    try {
      const res = await fetch('/api/create-checkouts-session', {
        method: 'POST',
        body: JSON.stringify({ lesson }),
      });

      const data = await res.json();
      if (data.url) {
        setTimeout(() => {
          window.location.href = data.url;
        }, 500);
      } else {
        console.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setSelectedLessonId(null);
    }
  };

  return (
    <div className="relative @container">
      <animated.div style={trail[0]}>
        <Typography.H4 className="my-6 md:text-2xl text-foreground text-center md:text-left">
          <span className="font-bold text-tennis-green">Availability</span> on{' '}
          {format(date, 'EEEE MMMM d')}
        </Typography.H4>
      </animated.div>

      <div className="mx-auto grid grid-cols-1 gap-3 @[500px]:grid-cols-2 max-w-[570px] md:mx-0">
        {trail.slice(1).map((style, index) => (
          <animated.div
            key={availableLessons[index].id}
            style={style}
            className="mx-auto max-w-[300px] lg:max-w-[280px] w-full md:mx-0"
          >
            <Lesson
              lesson={availableLessons[index]}
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
};

export default AvailableLessons;

import { format } from 'date-fns/format';
import { Availability } from '../services/availabilities';
import Lesson from './Lesson';
import { Typography } from './ui/typography';

import React from 'react';
import Loader from './Loader';

type AvailableLessonsProps = {
  availableLessons: Availability[];
  date: string;
};

const AvailableLessons: React.FC<AvailableLessonsProps> = ({ availableLessons, date }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedLessonId, setSelectedLessonId] = React.useState<string | null>(null);

  if (!date) return null;

  const getGridClass = () => {
    const count = availableLessons.length;

    if (count > 3) {
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
    } else {
      return 'flex justify-end';
    }
  };

  const handleCheckout = async (lesson: Availability) => {
    setIsLoading(true);
    setSelectedLessonId(lesson.id);

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ lesson })
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
    <div className="relative">
      <Typography.H2 className="text-2xl md:text-3xl mb-6 text-foreground">
        <span className="font-bold text-lime-500">Availability</span> on{' '}
        {format(date, 'EEEE MMMM d')}
      </Typography.H2>

      <div className={`${getGridClass()} gap-3 ml-auto`}>
        {[...availableLessons].map((availability, index) => (
          <Lesson
            key={index}
            lesson={availability}
            isLoading={isLoading}
            onLessonSelected={handleCheckout}
            selectedLessonId={selectedLessonId}
          />
        ))}
      </div>

      {isLoading && <Loader message="Preparing your checkout..." />}
    </div>
  );
};

export default AvailableLessons;

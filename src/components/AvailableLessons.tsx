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
      <Typography.H3 className="my-6 text-foreground">
        <span className="font-bold text-tennis-green">Availability</span> on{' '}
        {format(date, 'EEEE MMMM d')}
      </Typography.H3>

      <div className="flex flex-wrap gap-3 ml-auto">
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

import { format } from 'date-fns/format';
import { Availability } from '../services/availabilities';
import Lesson from './Lesson';
import { Typography } from './ui/typography';
import { Loader2 } from 'lucide-react';

import React from 'react';

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
      // setIsLoading(false);
      setSelectedLessonId(null);
    }
  };

  return (
    <div className="px-24 pb-12 relative">
      <Typography.H2 className="text-2xl md:text-3xl mb-6 text-foreground text-right">
        <span className="font-bold text-lime-500">Availability</span> on{' '}
        {format(date, 'EEEE, MMMM d')}
      </Typography.H2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {availableLessons.map((availability, index) => (
          <Lesson
            key={index}
            lesson={availability}
            isLoading={isLoading}
            onLessonSelected={handleCheckout}
            selectedLessonId={selectedLessonId}
          />
        ))}
      </div>

      {/* Full page overlay when loading */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
            <Typography.P>Preparing your checkout...</Typography.P>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableLessons;

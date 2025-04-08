import React from 'react';

import { LessonAvailability } from '@/graphql/availabilities';
import { Card, CardContent } from './ui/card';
import { formatTime } from '../lib/date';
import { Typography } from './ui/typography';
import PriceTag from './PriceTag';
import { formatCurrency } from '../lib/currency';
import { format } from 'date-fns';

type LessonProps = {
  lesson: LessonAvailability;
  onLessonSelected: (lesson: LessonAvailability) => void;
};

const Lesson: React.FC<LessonProps> = ({ lesson, onLessonSelected }) => {
  return (
    <Card
      className="relative transition-transform hover:translate-y-[-4px] shadow-md hover:shadow-lg cursor-pointer"
      onClick={() => onLessonSelected(lesson)}
    >
      <CardContent className="flex flex-col align-center justify-center gap-1">
        <Typography.Small className="text-gray-700 whitespace-nowrap">
          {format(lesson.availabilityDate, 'EEEE, MMMM d')}
        </Typography.Small>
        <Typography.Large className="text-gray-700 whitespace-nowrap">
          {formatTime(lesson.availabilityStartTime)} - {formatTime(lesson.availabilityEndTime)}
        </Typography.Large>
        <Typography.P className="text-lime-600 font-bold">
          {formatCurrency(lesson.price)}
        </Typography.P>
      </CardContent>
    </Card>
  );
};

export default Lesson;

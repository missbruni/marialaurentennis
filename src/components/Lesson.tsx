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
      className="relative transition-transform hover:translate-y-[-4px] shadow-md hover:shadow-lg cursor-pointer bg-white dark:bg-[#242423]"
      onClick={() => onLessonSelected(lesson)}
    >
      <CardContent className="flex flex-col align-center justify-center gap-1">
        <Typography.Small className="text-foreground dark:text-foreground whitespace-nowrap">
          {format(lesson.availabilityDate, 'EEEE, MMMM d')}
        </Typography.Small>
        <Typography.Large className="text-foreground dark:text-foreground whitespace-nowrap">
          {formatTime(lesson.availabilityStartTime)} - {formatTime(lesson.availabilityEndTime)}
        </Typography.Large>
        <Typography.P className="text-lime-600 dark:text-lime-400 font-bold">
          {formatCurrency(lesson.price)}
        </Typography.P>
      </CardContent>
    </Card>
  );
};

export default Lesson;

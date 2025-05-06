import React from 'react';

import type { Availability } from '@/services/availabilities';
import { Card, CardContent } from './ui/card';
import { formatTime } from '../lib/date';
import { Typography } from './ui/typography';
import { formatCurrency } from '../lib/currency';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export type LessonProps = {
  lesson: Availability;
  onLessonSelected: (lesson: Availability) => void;
  isLoading?: boolean;
  selectedLessonId?: string | null;
};

const Lesson: React.FC<LessonProps> = ({
  lesson,
  onLessonSelected,
  isLoading = false,
  selectedLessonId = null
}) => {
  const isSelected = selectedLessonId === lesson.id;

  return (
    <Card
      className={`py-3 md:py-4 relative transition-transform hover:translate-y-[-4px] shadow-md hover:shadow-lg cursor-pointer bg-white dark:bg-[#242423]`}
      onClick={() => !isLoading && onLessonSelected(lesson)}
    >
      <CardContent className="flex flex-col align-center justify-center gap-1">
        <Typography.Small className="text-foreground dark:text-foreground whitespace-nowrap">
          {format(lesson.startDateTime.toDate(), 'EE, MMMM d')}
        </Typography.Small>
        <Typography.Large className="text-foreground dark:text-foreground whitespace-nowrap">
          {formatTime(lesson.startDateTime)} - {formatTime(lesson.endDateTime)}
        </Typography.Large>
        <Typography.P className="text-tennis-green font-bold">
          {formatCurrency(lesson.price)}
        </Typography.P>

        {isSelected && isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm rounded-md">
            <Loader2 className="h-6 w-6 animate-spin text-tennis-green" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Lesson;

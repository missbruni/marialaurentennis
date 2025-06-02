import React from 'react';

import type { Availability } from '@/services/availabilities';
import { Card, CardContent } from './ui/card';
import { formatTime } from '../lib/date';
import { Typography } from './ui/typography';
import { formatCurrency } from '../lib/currency';
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
      className="flex-1 min-w-[230px] max-w-[400px] flex-shrink-0 basis-0 py-3 md:py-4 relative transition-transform hover:translate-y-[-4px] shadow-md hover:shadow-lg cursor-pointer bg-white dark:bg-[#242423]"
      onClick={() => !isLoading && onLessonSelected(lesson)}
    >
      <CardContent className="flex flex-row align-center justify-between gap-1">
        <Typography.P className="text-foreground dark:text-foreground whitespace-nowrap">
          {formatTime(lesson.startDateTime)} - {formatTime(lesson.endDateTime)}
        </Typography.P>
        <Typography.P className="text-tennis-green">
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

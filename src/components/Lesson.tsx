'use client';

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

const Lesson: React.FC<LessonProps> = React.memo(
  ({ lesson, onLessonSelected, isLoading = false, selectedLessonId = null }) => {
    const isSelected = selectedLessonId === lesson.id;

    const handleClick = React.useCallback(() => {
      if (!isLoading) {
        onLessonSelected(lesson);
      }
    }, [isLoading, onLessonSelected, lesson]);

    return (
      <Card
        className="relative flex h-full w-full min-w-[240px] basis-0 cursor-pointer flex-col bg-white py-3 shadow-md transition-transform hover:translate-y-[-4px] hover:shadow-lg md:py-4 dark:bg-[#242423]"
        onClick={handleClick}
      >
        <CardContent className="flex justify-between">
          <Typography.P className="text-foreground dark:text-foreground whitespace-nowrap">
            {formatTime(lesson.startDateTime)} - {formatTime(lesson.endDateTime)}
          </Typography.P>
          <Typography.P className="text-tennis-green">{formatCurrency(lesson.price)}</Typography.P>

          {isSelected && isLoading && (
            <div className="bg-background/30 absolute inset-0 flex items-center justify-center rounded-md backdrop-blur-sm">
              <Loader2 className="text-tennis-green h-6 w-6 animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

Lesson.displayName = 'Lesson';
export default Lesson;

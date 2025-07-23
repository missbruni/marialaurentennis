import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

export type StatusChipColor = 'blue' | 'green' | 'yellow' | 'purple' | 'indigo' | 'gray' | 'red';

export type StatusCardProps = {
  title: string;
  description: string;
  actionText?: string;
  statusText: string;
  statusColor: StatusChipColor;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
};

export function StatusCard({
  title,
  description,
  actionText,
  statusText,
  statusColor,
  onClick,
  className,
  disabled = false,
  children
}: StatusCardProps) {
  const getStatusColorClasses = (color: StatusChipColor) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    return colorMap[color];
  };

  return (
    <Card
      className={cn(
        'shadow-md transition-transform dark:bg-[#242423]',
        !disabled && 'cursor-pointer hover:translate-y-[-2px] hover:shadow-lg',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
    >
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <Typography.Large>{title}</Typography.Large>
          <div className={cn('rounded-full px-3 py-1 text-sm', getStatusColorClasses(statusColor))}>
            {statusText}
          </div>
        </div>
        <Typography.P className="text-muted-foreground mb-4">{description}</Typography.P>
        {children && <div className="mb-4">{children}</div>}
        {actionText && (
          <div className="mt-auto">
            <button
              className={cn(
                'text-primary font-medium',
                !disabled && 'hover:text-primary/80',
                disabled && 'opacity-50'
              )}
              disabled={disabled}
            >
              {actionText} →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

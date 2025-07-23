import React from 'react';
import { DialogContent, DialogClose } from '@/components/ui/dialog';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmationDialogContentProps extends React.ComponentProps<typeof DialogContent> {
  hideCloseButton?: boolean;
}

export function ConfirmationDialogContent({
  className,
  children,
  hideCloseButton = false,
  ...props
}: ConfirmationDialogContentProps) {
  return (
    <DialogContent className={cn('sm:max-w-lg', className)} {...props}>
      {children}
      {!hideCloseButton && (
        <DialogClose className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogClose>
      )}
    </DialogContent>
  );
}

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

export default function ErrorPage() {
  const [open, setOpen] = React.useState(true);
  const router = useRouter();

  const handleClose = () => {
    setOpen(false);
    router.replace('/');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            Booking Failed
          </DialogTitle>
          <DialogDescription>
            There was an error processing your booking. Please try again.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end">
          <Button onClick={handleClose}>Return to Home</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

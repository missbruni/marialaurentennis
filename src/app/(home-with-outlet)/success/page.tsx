'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import { Suspense } from 'react';
import SuccessContent from './SuccessContent';

export default function SuccessPage() {
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
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Booking Confirmed
          </DialogTitle>
        </DialogHeader>

        <Suspense fallback={<div>Loading booking details...</div>}>
          <SuccessContent onClose={handleClose} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Suspense } from 'react';
import { useSectionRef } from '@/hooks/useSectionRef';
import Confirmation from './Confirmation';

export default function SuccessPage() {
  const [open, setOpen] = React.useState(true);
  const router = useRouter();
  const { scrollToBookingForm } = useSectionRef();

  const handleClose = () => {
    setOpen(false);
    router.replace('/');
  };

  const handleBookAnother = () => {
    handleClose();
    setTimeout(() => {
      scrollToBookingForm();
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <Suspense fallback={<div>Loading booking details...</div>}>
          <Confirmation onClose={handleClose} onBookAnother={handleBookAnother} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

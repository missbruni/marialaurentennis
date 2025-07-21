'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Suspense } from 'react';
import ConfirmationContent from './ConfirmationContent';

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
        <Suspense fallback={<div>Loading booking details...</div>}>
          <ConfirmationContent onClose={handleClose} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

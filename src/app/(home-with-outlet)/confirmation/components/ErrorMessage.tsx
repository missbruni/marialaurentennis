import React from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  queryError: Error | null;
  showTimeoutError: boolean;
  sessionId: string | null;
}

export function ErrorMessage({ queryError, showTimeoutError, sessionId }: ErrorMessageProps) {
  const [copied, setCopied] = React.useState(false);

  if (!queryError && !showTimeoutError) return null;

  const handleCopyPaymentId = async () => {
    if (sessionId) {
      try {
        await navigator.clipboard.writeText(sessionId);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error('Failed to copy payment ID:', err);
      }
    }
  };

  return (
    <div>
      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        <p className="mb-1 font-medium">Important:</p>
        <p>
          Your payment was processed successfully, but there was an issue confirming your booking.
          Please{' '}
          <a
            href={`mailto:maria@tennislessons.com?subject=Booking Issue - Payment ID: ${sessionId}&body=Hi Maria,%0D%0A%0D%0AI'm having an issue with my booking confirmation.%0D%0A%0D%0APayment ID: ${sessionId}%0D%0A%0D%0APlease help me resolve this issue.%0D%0A%0D%0AThank you.`}
            className="text-blue-600 underline hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            contact us
          </a>{' '}
          for assistance. We&apos;ll help you resolve this issue.
        </p>
      </div>
      <p className="mt-3 text-sm">
        Your payment ID:{' '}
        <span className="break-all text-gray-600 dark:text-gray-300">{sessionId}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyPaymentId}
          className="hover:bg-accent relative ml-1 cursor-pointer p-0"
          title={copied ? 'Copied!' : 'Copy payment ID'}
          style={{ cursor: 'pointer' }}
        >
          {copied ? (
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 font-bold text-green-600" />
              <span className="text-xs font-medium text-green-600">Copied!</span>
            </div>
          ) : (
            <Copy className="text-muted-foreground hover:text-foreground h-3 w-3 font-bold" />
          )}
          <span className="sr-only">Copy payment ID</span>
        </Button>
      </p>
    </div>
  );
}

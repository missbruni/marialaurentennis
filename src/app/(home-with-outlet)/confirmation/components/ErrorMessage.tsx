import React from 'react';

interface ErrorMessageProps {
  queryError: Error | null;
  showTimeoutError: boolean;
  sessionId: string | null;
}

export function ErrorMessage({ queryError, showTimeoutError, sessionId }: ErrorMessageProps) {
  if (!queryError && !showTimeoutError) return null;

  return (
    <div className="text-red-500">
      <p>There was an issue confirming your booking:</p>
      {queryError ? (
        <p>{queryError instanceof Error ? queryError.message : 'Failed to load booking details'}</p>
      ) : (
        <p>Your booking is taking longer than expected to confirm.</p>
      )}
      <p className="mt-2">
        Your payment ID: <span className="break-all text-red-400">{sessionId}</span>
      </p>
      <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        <p className="mb-1 font-medium">Important:</p>
        <p>
          Your payment was processed successfully, but there was an issue confirming your booking
          record. Please contact us with your payment ID for assistance.
        </p>
      </div>
    </div>
  );
}

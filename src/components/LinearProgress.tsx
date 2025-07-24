import React from 'react';

export default function LinearProgress() {
  return (
    <div className="w-full overflow-hidden" style={{ height: 4 }}>
      <div
        className="h-full w-full animate-pulse"
        style={{
          background: `linear-gradient(90deg, transparent, var(--color-tennis-green), transparent)`,
          animation: 'linearProgress 1.5s infinite ease-in-out'
        }}
      />
      <style>{`
        @keyframes linearProgress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

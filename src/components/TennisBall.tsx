import React from 'react';

type TennisBallProps = {
  left?: string;
  right?: string;
  width?: string;
  topPercent?: number;
  bottomPercent?: number;
};

const TennisBall: React.FC<TennisBallProps> = React.memo(
  ({ left, right, width = '18rem', topPercent = 80, bottomPercent = 20 }) => {
    const [scrollY, setScrollY] = React.useState(0);

    // Memoize the scroll handler to prevent unnecessary re-renders
    const handleScroll = React.useCallback(() => {
      setScrollY(window.scrollY);
    }, []);

    React.useEffect(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return (
      <div
        className="absolute z-0 opacity-80"
        style={{
          width,
          height: width,
          bottom: `calc(${bottomPercent}% - ${scrollY * 0.3}px)`,
          top: `calc(${topPercent}% + ${scrollY * -0.5}px)`,
          ...(left && { left }),
          ...(right && { right }),
          backgroundImage: "url('/tennis-ball.webp')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          transform: `rotate(${scrollY * 0.3}deg)`,
          transition: 'transform 0.1s ease-out'
        }}
      />
    );
  }
);

TennisBall.displayName = 'TennisBall';
export default TennisBall;

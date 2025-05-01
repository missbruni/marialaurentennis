import React from 'react';

type TennisBallProps = {
  left?: string;
  right?: string;
  width?: string;
  topPercent?: number;
  bottomPercent?: number;
};

const TennisBall: React.FC<TennisBallProps> = ({
  left,
  right,
  width = '18rem',
  topPercent = 80,
  bottomPercent = 20
}) => {
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        backgroundImage: "url('/tennis-ball.png')",
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        transform: `rotate(${scrollY * 0.3}deg)`,
        transition: 'transform 0.1s ease-out'
      }}
    />
  );
};
export default TennisBall;

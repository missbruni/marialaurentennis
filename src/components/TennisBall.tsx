import React from 'react';

const TennisBall: React.FC = () => {
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
      className="absolute w-64 h-64 md:w-76 md:h-76 z-0 opacity-80"
      style={{
        bottom: `calc(20% - ${scrollY * 0.3}px)`,
        top: `calc(80% + ${scrollY * -0.5}px)`,
        left: '-100px',
        backgroundImage: "url('/tennis-ball.png')",
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        transform: `rotate(${scrollY * 0.1}deg)`,
        transition: 'transform 0.1s ease-out'
      }}
    />
  );
};
export default TennisBall;

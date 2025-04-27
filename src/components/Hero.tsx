import { useBookingForm } from './hooks/useBookingForm';
import { Button } from './ui/button';

const Hero: React.FC = () => {
  const { scrollToBookingForm } = useBookingForm();

  return (
    <section className="relative h-screen w-full flex items-center justify-center text-white bg-white">
      <div className="absolute inset-0 bg-[url('/tennis-hero1.jpg')] bg-cover bg-center bg-fixed opacity-80"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 z-0"></div>
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Maria Lauren Tennis</h1>
        <p className="text-lg md:text-xl max-w-xl mx-auto mb-6 drop-shadow-md">
          Personalized coaching, convenient scheduling, and world-class support to level up your
          game.
        </p>

        <Button
          size="lg"
          variant="ghost"
          className="bg-white text-black font-semibold px-6 py-3 no-border"
          onClick={scrollToBookingForm}
          aria-label="Book Lesson"
        >
          Book a Lesson
        </Button>
      </div>
    </section>
  );
};
export default Hero;

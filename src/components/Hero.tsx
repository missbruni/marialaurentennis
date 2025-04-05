import Link from "next/link";

type HeroProps = {
  onBookLesson: () => void;
};
const Hero: React.FC<HeroProps> = ({ onBookLesson }) => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center text-white">
      <div className="absolute inset-0 bg-[url('/tennis-hero1.jpg')] bg-cover bg-center opacity-80"></div>
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
          Maria Lauren Tennis
        </h1>
        <p className="text-lg md:text-xl max-w-xl mx-auto mb-6 drop-shadow-md">
          Personalized coaching, convenient scheduling, and world-class support
          to level up your game.
        </p>
        <button
          onClick={onBookLesson}
          className="bg-white text-black font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition"
        >
          Book a Lesson
        </button>
      </div>
    </section>
  );
};
export default Hero;

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import Login from './Login';
import { useBookingForm } from './hooks/useBookingForm';
import { useTheme } from 'next-themes';

const AppBar = () => {
  const { theme } = useTheme();
  const { scrollToBookingForm } = useBookingForm();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleBookLesson = () => {
    scrollToBookingForm();
    setMobileMenuOpen(false);
  };

  const logoSrc = theme === 'dark' ? '/fullname-white.svg' : '/fullname.svg';

  return (
    <header className="sticky top-0 z-50 w-full h-20 px-4 md:px-8 dark:bg-[#181818] bg-white">
      <div className="max-w-screen-2xl mx-auto flex h-20 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl text-foreground">
            <Image src={logoSrc} alt="Maria Lauren Tennis" width={80} height={64} />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="font-medium text-foreground hover:text-primary hover:font-bold transition-all duration-200"
          >
            Home
          </Link>
          <button
            className="font-medium text-foreground hover:text-primary hover:font-bold transition-all duration-200 bg-transparent border-none p-0 cursor-pointer"
            onClick={handleBookLesson}
          >
            Lessons
          </button>
          <Link
            href="#"
            className="font-medium text-foreground hover:text-primary hover:font-bold transition-all duration-200"
          >
            Coaches
          </Link>
          <Link
            href="/admin"
            className="font-medium text-foreground hover:text-primary hover:font-bold transition-all duration-200"
          >
            Admin
          </Link>
          <Link
            href="#"
            className="font-medium text-foreground hover:text-primary hover:font-bold transition-all duration-200"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Login />

          <Button
            className="hidden md:inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 h-9 px-4"
            onClick={handleBookLesson}
            aria-label="Book Now"
          >
            Book Now
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md">
          <nav className="flex flex-col items-center py-4">
            <Link
              href="/"
              className="w-full text-center py-3 font-medium transition-all duration-200 hover:text-primary hover:font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/lessons"
              className="w-full text-center py-3 font-medium transition-all duration-200 hover:text-primary hover:font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Camps
            </Link>
            <Link
              href="/coaches"
              className="w-full text-center py-3 font-medium transition-all duration-200 hover:text-primary hover:font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Coaches
            </Link>
            <div className="flex gap-4 mt-4">
              <Login
                className="border-1 hover:text-primary hover:font-bold duration-200 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-white/20 text-foreground h-9 px-4"
                onClick={() => setMobileMenuOpen(false)}
              />
              <button
                onClick={handleBookLesson}
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 h-9 px-4"
              >
                Book Now
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default AppBar;

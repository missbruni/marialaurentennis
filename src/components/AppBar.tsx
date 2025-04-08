import React, { useState } from 'react';
import Link from 'next/link';
import { ModeToggle } from './ThemeToggle';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';

const AppBar = ({ onBookLesson }: { onBookLesson: () => void }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleBookLesson = () => {
    onBookLesson();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent px-4 md:px-8">
      <div className="max-w-screen-2xl mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl text-foreground">
            Maria Lauren Tennis
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
            href="#"
            className="font-medium text-foreground hover:text-primary hover:font-bold transition-all duration-200"
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="font-medium text-foreground hover:text-primary hover:font-bold transition-all duration-200"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <Link
            href="#"
            className="hidden md:inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-white/20 text-foreground h-9 px-4"
          >
            Login
          </Link>
          <button
            onClick={handleBookLesson}
            className="hidden md:inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 h-9 px-4"
          >
            Book Now
          </button>

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
              Lessons
            </Link>
            <Link
              href="/coaches"
              className="w-full text-center py-3 font-medium transition-all duration-200 hover:text-primary hover:font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Coaches
            </Link>
            <Link
              href="/pricing"
              className="w-full text-center py-3 font-medium transition-all duration-200 hover:text-primary hover:font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="w-full text-center py-3 font-medium transition-all duration-200 hover:text-primary hover:font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="flex gap-4 mt-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/booking"
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 h-9 px-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Now
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default AppBar;

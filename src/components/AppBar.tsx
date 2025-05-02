'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import { ThemeToggle } from './ThemeToggle';
import { Menu } from 'lucide-react';
import { Button } from './ui/button';
import Login from './Login';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useBookingForm } from '../hooks/useBookingForm';
import { Separator } from './ui/separator';

export const HEADER_HEIGHT = 72;
const AppBar = () => {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();

  const { scrollToBookingForm } = useBookingForm();

  const [logoSrc, setLogoSrc] = React.useState('/fullname.svg');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleBookLesson = () => {
    setMobileMenuOpen(false);
    if (pathname !== '/') {
      router.push('/');

      setTimeout(() => {
        scrollToBookingForm();
      }, 300);
    } else {
      scrollToBookingForm();
    }
  };

  const handleMobileMenuItemClick = () => {
    setMobileMenuOpen(false);
  };

  React.useEffect(() => {
    setLogoSrc(theme === 'dark' ? '/fullname-white.svg' : '/fullname.svg');
  }, [theme]);

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <header className="sticky top-0 z-50 w-full h-18 px-4 md:px-8 dark:bg-[#181818] bg-white">
        <div className="max-w-screen-2xl mx-auto flex h-18 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold text-xl text-foreground">
              {logoSrc && <Image src={logoSrc} alt="Maria Lauren Tennis" width={70} height={50} />}
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

            {/* TODO: add this to admin role users only */}
            {isAdmin && (
              <Link
                href="/admin"
                className="font-medium text-foreground hover:text-primary hover:font-bold transition-all duration-200"
              >
                Admin
              </Link>
            )}
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

            {/* Mobile Menu */}
            <Popover open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-foreground"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-screen p-0 mt-2 rounded-t-none rounded-b-xl shadow-lg border-none z-50"
                align="end"
                sideOffset={0}
              >
                <div className="flex flex-col py-6">
                  <nav className="flex flex-col  px-6">
                    <Link
                      href="/"
                      className="py-3 text-lg font-medium border-b border-border transition-colors hover:text-primary"
                      onClick={handleMobileMenuItemClick}
                    >
                      Home
                    </Link>
                    <button
                      onClick={() => {
                        handleBookLesson();
                        handleMobileMenuItemClick();
                      }}
                      className="py-3 text-lg font-medium border-b border-border transition-colors hover:text-primary text-left bg-transparent"
                    >
                      Lessons
                    </button>
                    <Link
                      href="/coaches"
                      className="py-3 text-lg font-medium border-b border-border transition-colors hover:text-primary"
                      onClick={handleMobileMenuItemClick}
                    >
                      Coaches
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="py-3 text-lg font-medium border-b border-border transition-colors hover:text-primary"
                        onClick={handleMobileMenuItemClick}
                      >
                        Admin
                      </Link>
                    )}
                    <Link
                      href="#"
                      className="py-3 text-lg font-medium border-b border-border transition-colors hover:text-primary"
                      onClick={handleMobileMenuItemClick}
                    >
                      Contact
                    </Link>
                  </nav>
                  <div className="mt-4 px-6 space-y-4">
                    <Button
                      className="w-full"
                      onClick={() => {
                        handleMobileMenuItemClick();
                        handleBookLesson();
                      }}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <Separator />
    </>
  );
};

export default AppBar;

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
import { useSectionRef } from '../hooks/useSectionRef';
import { Separator } from './ui/separator';
import SuspenseLoading from './SuspenseLoading';

export const HEADER_HEIGHT = 72;
const AppBar = () => {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();

  const { scrollToBookingForm, scrollToContact } = useSectionRef();

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

  const handleContactClick = () => {
    setMobileMenuOpen(false);
    if (pathname !== '/') {
      router.push('/');

      setTimeout(() => {
        scrollToContact();
      }, 300);
    } else {
      scrollToContact();
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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <header className="sticky top-0 z-50 h-18 w-full border-b-1 border-b-[var(--sidebar-border)] bg-white px-4 md:px-10 dark:bg-[#181818]">
        <div className="mx-auto flex h-18 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-foreground text-xl font-bold">
              {logoSrc && <Image src={logoSrc} alt="Maria Lauren Tennis" width={70} height={50} />}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="/"
              className="text-foreground hover:text-primary font-medium transition-all duration-200 hover:font-bold"
            >
              Home
            </Link>
            <button
              className="text-foreground hover:text-primary cursor-pointer border-none bg-transparent p-0 font-medium transition-all duration-200 hover:font-bold"
              onClick={handleBookLesson}
            >
              Lessons
            </button>
            <button
              className="text-foreground hover:text-primary cursor-pointer border-none bg-transparent p-0 font-medium transition-all duration-200 hover:font-bold"
              onClick={handleContactClick}
            >
              Contact
            </button>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-foreground hover:text-primary font-medium transition-all duration-200 hover:font-bold"
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 hidden h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors md:inline-flex"
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
                  className="text-foreground md:hidden"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="z-50 mt-2 w-screen rounded-t-none rounded-b-xl border-none p-0 shadow-lg"
                align="end"
                sideOffset={0}
              >
                <div className="flex flex-col py-6">
                  <nav className="flex flex-col px-6">
                    <Link
                      href="/"
                      className="border-border hover:text-primary border-b py-3 text-lg font-medium transition-colors"
                      onClick={handleMobileMenuItemClick}
                    >
                      Home
                    </Link>
                    <button
                      onClick={() => {
                        handleBookLesson();
                        handleMobileMenuItemClick();
                      }}
                      className="border-border hover:text-primary border-b bg-transparent py-3 text-left text-lg font-medium transition-colors"
                    >
                      Lessons
                    </button>
                    <button
                      onClick={() => {
                        handleContactClick();
                        handleMobileMenuItemClick();
                      }}
                      className="border-border hover:text-primary border-b bg-transparent py-3 text-left text-lg font-medium transition-colors"
                    >
                      Contact
                    </button>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="border-border hover:text-primary border-b py-3 text-lg font-medium transition-colors"
                        onClick={handleMobileMenuItemClick}
                      >
                        Admin
                      </Link>
                    )}
                  </nav>
                  <div className="mt-4 space-y-4 px-6">
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
            <SuspenseLoading>
              <Login />
            </SuspenseLoading>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <Separator />
    </>
  );
};

export default AppBar;

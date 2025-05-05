import React from 'react';
import { Typography } from './ui/typography';
import { FacebookIcon, InstagramIcon, TwitterIcon } from 'lucide-react';

const ContactForm: React.FC = () => {
  return (
    <section className="w-full bg-[#9E7240] text-white">
      <div className="container mx-auto p-10">
        <div className="flex flex-col items-center text-center">
          <Typography.H2 className="font-bold">Contact us</Typography.H2>

          <div className="mb-8">
            <Typography.Large className="mb-2">Maria Lauren Wisdom</Typography.Large>
          </div>
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/marialaurentennis/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Maria Lauren's Instagram"
              className="hover:opacity-80 transition-opacity"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.facebook.com/MariaLaurenTennis"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Maria Lauren's Instagram"
              className="hover:opacity-80 transition-opacity"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://x.com/marialaurenten1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Maria Lauren's Instagram"
              className="hover:opacity-80 transition-opacity"
            >
              <TwitterIcon />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;

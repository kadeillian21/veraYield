'use client';

import Link from 'next/link';
import React from 'react';

const Header = () => {
  return (
    <header className="bg-navy py-4 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="text-white font-bold text-xl">
          <Link href="/">
            VeraYield
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link 
                href="/" 
                className="text-white hover:text-turquoise transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                href="/about" 
                className="text-white hover:text-turquoise transition-colors"
              >
                About
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
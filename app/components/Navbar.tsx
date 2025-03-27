'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import AuthButton from '../auth/signin/components/AuthButton';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-navy py-4 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="text-white font-bold text-xl">
          <Link href="/">
            VeraYield
          </Link>
        </div>
        <div className="flex items-center space-x-6">
          {/* Desktop navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li>
                <Link 
                  href="/" 
                  className={`text-white hover:text-turquoise transition-colors ${
                    pathname === '/' ? 'text-turquoise font-semibold' : ''
                  }`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/compare" 
                  className={`text-white hover:text-turquoise transition-colors ${
                    pathname === '/compare' ? 'text-turquoise font-semibold' : ''
                  }`}
                >
                  Compare Deals
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className={`text-white hover:text-turquoise transition-colors ${
                    pathname === '/about' ? 'text-turquoise font-semibold' : ''
                  }`}
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-turquoise focus:outline-none"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>
          </div>
          
          <AuthButton />
        </div>
      </div>
      
      {/* Mobile navigation menu */}
      {isMenuOpen && (
        <div className="mt-4 md:hidden px-4 pb-4">
          <Link 
            href="/" 
            className={`block py-2 text-white hover:text-turquoise ${
              pathname === '/' ? 'text-turquoise font-semibold' : ''
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            href="/compare" 
            className={`block py-2 text-white hover:text-turquoise ${
              pathname === '/compare' ? 'text-turquoise font-semibold' : ''
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Compare Deals
          </Link>
          <Link 
            href="/about" 
            className={`block py-2 text-white hover:text-turquoise ${
              pathname === '/about' ? 'text-turquoise font-semibold' : ''
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
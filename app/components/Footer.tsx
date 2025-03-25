'use client';

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-navy text-white py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-white/80">&copy; {new Date().getFullYear()} VeraYield</p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-white/80 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-white/80 hover:text-white transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
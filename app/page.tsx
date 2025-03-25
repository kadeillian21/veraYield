'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Header from './components/Header';
import Footer from './components/Footer';

// Use dynamic import with no SSR to avoid hydration issues with client components
const DealAnalyzer = dynamic(
  () => import('./components/dealAnalyzer/DealAnalyzer'),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">VeraYield Investment Analyzer</h1>
        <p className="text-center mb-8 max-w-3xl mx-auto">
          Analyze different real estate investment strategies including long-term rentals, 
          BRRRR deals, short-term rentals, and more. Calculate returns, cash flow, and compare different approaches.
        </p>
        <DealAnalyzer />
      </main>
      
      <Footer />
    </div>
  );
}
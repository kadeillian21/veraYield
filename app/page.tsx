'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-navy mb-6">Welcome to VeraYield</h1>
        
        <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto">
          Your modern platform for analyzing real estate investments with confidence.
          Calculate ROI, cash flow, and compare different investment strategies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
            <div className="bg-navy/10 rounded-full p-4 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Analyze Deals</h3>
            <p className="text-gray-600 mb-4 text-center">
              Create detailed analyses for any real estate investment strategy.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
            <div className="bg-navy/10 rounded-full p-4 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Compare Investments</h3>
            <p className="text-gray-600 mb-4 text-center">
              See properties side-by-side to make informed investment decisions.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
            <div className="bg-navy/10 rounded-full p-4 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Projection Tools</h3>
            <p className="text-gray-600 mb-4 text-center">
              Forecast returns using detailed financial projections.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
          <Link 
            href="/deals" 
            className="bg-navy hover:bg-navy/90 text-white py-4 px-8 rounded-lg font-semibold text-lg shadow-md transition-colors"
          >
            Get Started
          </Link>
          
          <Link 
            href="/about" 
            className="bg-white hover:bg-gray-100 text-navy py-4 px-8 rounded-lg font-semibold text-lg shadow-md border border-gray-200 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}

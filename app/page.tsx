'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-navy mb-6">VeraYield: The #1 BRRRR Calculator for Real Estate Investors</h1>
        
        <p className="text-xl text-gray-700 mb-6 max-w-3xl mx-auto">
          Your professional-grade platform for analyzing BRRRR (Buy, Rehab, Rent, Refinance, Repeat) 
          real estate investments with confidence. Calculate ROI, cash flow, and model refinance scenarios 
          with unmatched precision.
        </p>
        
        <p className="text-lg text-gray-700 mb-12 max-w-3xl mx-auto">
          Whether you're a seasoned investor or just getting started with the BRRRR strategy, 
          our comprehensive calculator helps you make data-driven decisions to maximize your returns.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
            <div className="bg-navy/10 rounded-full p-4 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">BRRRR Calculator</h3>
            <p className="text-gray-600 mb-4 text-center">
              The most comprehensive BRRRR calculator with purchase, rehab, rental, and refinance analysis in one place.
            </p>
            <ul className="text-sm text-left text-gray-600 w-full">
              <li className="mb-1">✓ Detailed rehab cost tracking</li>
              <li className="mb-1">✓ Holding cost calculations</li>
              <li className="mb-1">✓ Refinance outcome prediction</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
            <div className="bg-navy/10 rounded-full p-4 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Investment Metrics</h3>
            <p className="text-gray-600 mb-4 text-center">
              Calculate key BRRRR metrics including cash-on-cash return, ROI, and capital recovery analysis.
            </p>
            <ul className="text-sm text-left text-gray-600 w-full">
              <li className="mb-1">✓ Cash flow projections</li>
              <li className="mb-1">✓ All-money-out refinancing</li>
              <li className="mb-1">✓ Evaluate BRRRR success</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
            <div className="bg-navy/10 rounded-full p-4 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">5-Year Projections</h3>
            <p className="text-gray-600 mb-4 text-center">
              Model property appreciation, rent increases, and long-term wealth building with your BRRRR investments.
            </p>
            <ul className="text-sm text-left text-gray-600 w-full">
              <li className="mb-1">✓ Property value tracking</li>
              <li className="mb-1">✓ Rental income growth</li>
              <li className="mb-1">✓ Capital expense planning</li>
            </ul>
          </div>
        </div>
        
        {/* Testimonials section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-navy mb-10">Why Investors Trust Our BRRRR Calculator</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="text-amber-500 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 font-semibold text-gray-800">Michael T., Real Estate Investor</span>
              </div>
              <p className="text-gray-700">
                "The most accurate BRRRR calculator I've found. I've run over 20 deals through it and the projections match my actual results nearly perfectly. The ability to model the refinance step is what sets this apart."
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="text-amber-500 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 font-semibold text-gray-800">Sarah K., BRRRR Strategy Specialist</span>
              </div>
              <p className="text-gray-700">
                "As someone who exclusively uses the BRRRR method, this calculator has replaced my complex spreadsheets. The holding cost calculations and refinance scenarios are detailed yet easy to understand."
              </p>
            </div>
          </div>
        </div>
        
        {/* SEO-optimized FAQ */}
        <div className="mb-16 text-left">
          <h2 className="text-3xl font-bold text-navy mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-xl font-semibold mb-2">What is the BRRRR strategy in real estate?</h3>
              <p className="text-gray-700">
                BRRRR stands for Buy, Rehab, Rent, Refinance, Repeat. It's a real estate investment strategy where you purchase undervalued properties, renovate them to increase value, rent them out for cash flow, refinance to recover your initial investment, and then repeat the process with the recovered capital.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-xl font-semibold mb-2">How does the VeraYield BRRRR calculator work?</h3>
              <p className="text-gray-700">
                Our BRRRR calculator guides you through each step of the BRRRR process with dedicated modules for property information, acquisition costs, rehab planning, rental income and expenses, refinance analysis, and long-term projections. It calculates your cash flow, determines if you'll be able to recover your capital during refinancing, and projects your returns over time.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-xl font-semibold mb-2">What makes a successful BRRRR deal?</h3>
              <p className="text-gray-700">
                A successful BRRRR deal typically recovers most or all of your initial investment during the refinance phase while maintaining positive cash flow after the refinance. Our calculator specifically shows if your refinance will allow you to pull out all of your initial capital, making it a "true BRRRR" with infinite returns on the capital left in the deal.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link 
            href="/deals" 
            className="bg-navy hover:bg-navy/90 text-white py-4 px-8 rounded-lg font-semibold text-lg shadow-md transition-colors"
          >
            Try Our BRRRR Calculator
          </Link>
          
          <Link 
            href="/about" 
            className="bg-white hover:bg-gray-100 text-navy py-4 px-8 rounded-lg font-semibold text-lg shadow-md border border-gray-200 transition-colors"
          >
            Learn More About BRRRR
          </Link>
        </div>
        
        {/* SEO footer text */}
        <div className="text-sm text-gray-600 max-w-3xl mx-auto">
          <p>
            VeraYield offers the most comprehensive BRRRR calculator available online, helping real estate investors analyze every aspect of the Buy, Rehab, Rent, Refinance, Repeat strategy. Make smarter investment decisions with professional-grade financial analysis tools designed specifically for BRRRR real estate investments.
          </p>
        </div>
      </div>
    </div>
  );
}

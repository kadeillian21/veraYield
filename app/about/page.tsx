'use client';

import React from 'react';
import Link from 'next/link';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">About VeraYield: The #1 BRRRR Calculator</h1>
        
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-navy">Our Mission</h2>
          <p className="mb-6">
            VeraYield was created by real estate investors for real estate investors. Our mission is to provide 
            the most comprehensive BRRRR (Buy, Rehab, Rent, Refinance, Repeat) calculator on the market. 
            We're dedicated to helping investors analyze different real estate investment strategies with 
            confidence and precision, with special focus on the powerful BRRRR method that builds wealth through 
            strategic refinancing and reinvestment.
          </p>
          
          <h2 className="text-2xl font-bold mb-4 text-navy">Why Our BRRRR Calculator Stands Out</h2>
          <p className="mb-6">
            Most real estate calculators fall short when handling the complete BRRRR strategy. They either miss the 
            refinance analysis, don't account for holding costs during rehab, or fail to show if you're truly getting 
            all your capital back out. VeraYield was specifically designed to address these gaps and provide a complete 
            solution for serious BRRRR investors.
          </p>
          
          <h2 className="text-2xl font-bold mb-4 text-navy">Features of Our BRRRR Calculator</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-navy">Acquisition Analysis</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Purchase price evaluation</li>
                <li>Detailed closing cost breakdown</li>
                <li>Initial financing options</li>
                <li>Cash needed to close calculator</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2 text-navy">Rehab Planning</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Itemized rehab budget tracking</li>
                <li>Holding cost calculations during rehab</li>
                <li>Rehab timeline planning</li>
                <li>After Repair Value (ARV) estimation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2 text-navy">Rental Income</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Detailed income projections</li>
                <li>Vacancy and expense modeling</li>
                <li>Property management calculations</li>
                <li>Capital expense reserving</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2 text-navy">Refinance Analysis</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>LTV and cash-out calculation</li>
                <li>Capital recovery tracking</li>
                <li>Breakeven refinance ARV</li>
                <li>"True BRRRR" success indicator</li>
              </ul>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-navy">Additional Investment Strategies</h2>
          <p className="mb-4">
            While we specialize in BRRRR analysis, our calculator also supports other popular real estate strategies:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2 text-gray-700">
            <li>Long-term rental property evaluation with cash flow analysis</li>
            <li>Short-term rental income projections with seasonality modeling</li>
            <li>Multi-family property analysis for 2-4 unit properties</li>
            <li>House hacking strategy planning for owner-occupied investments</li>
            <li>Deal comparison tools to evaluate multiple properties side-by-side</li>
          </ul>
          
          <h2 className="text-2xl font-bold mb-4 text-navy">How Our BRRRR Calculator Works</h2>
          <p className="mb-6">
            Our calculator uses sophisticated financial modeling and industry-standard formulas to provide accurate 
            projections for your BRRRR investments. The calculations account for:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-1 text-gray-700">
            <li>Initial acquisition and rehab costs to determine total capital invested</li>
            <li>Detailed refinance scenarios based on ARV and LTV ratios</li>
            <li>Post-refinance cash flow analysis using the new debt service</li>
            <li>Capital recovery metrics to evaluate BRRRR success</li>
            <li>Long-term appreciation and equity building projections</li>
            <li>Cash-on-cash and total ROI calculations specific to BRRRR strategy</li>
          </ul>
          
          <h2 className="text-2xl font-bold mb-4 text-navy">Get Started with the Best BRRRR Calculator</h2>
          <p className="mb-4">
            Ready to analyze your next BRRRR deal with professional-grade tools? Our calculator is free to use 
            and provides immediate insights into your potential investments.
          </p>
          <div className="flex justify-center mb-6">
            <Link 
              href="/deals" 
              className="bg-navy hover:bg-navy/90 text-white py-3 px-8 rounded-lg font-semibold text-lg shadow-md transition-colors"
            >
              Try Our BRRRR Calculator Now
            </Link>
          </div>
          <p className="text-center text-sm text-gray-600">
            No account required - your BRRRR analyses are saved locally on your device for privacy.
          </p>
        </div>
    </div>
  );
}
'use client';

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">About VeraYield</h1>
        
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-navy">Our Mission</h2>
          <p className="mb-6">
            VeraYield is designed to help investors analyze different
            real estate investment strategies with confidence. Our goal is to provide intuitive 
            tools that make complex investment analysis accessible to everyone.
          </p>
          
          <h2 className="text-2xl font-bold mb-4 text-navy">Features</h2>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>BRRRR (Buy, Rehab, Rent, Refinance, Repeat) deal analysis</li>
            <li>Long-term rental property evaluation</li>
            <li>Short-term rental income projections</li>
            <li>Multi-family property analysis</li>
            <li>House hacking strategy planning</li>
            <li>Save and compare multiple investment opportunities</li>
            <li>Detailed property cash flow projections</li>
          </ul>
          
          <h2 className="text-2xl font-bold mb-4 text-navy">How It Works</h2>
          <p className="mb-6">
            Our calculator uses industry-standard formulas and methodologies to provide accurate 
            projections for your real estate investments. The calculations take into account 
            factors such as financing costs, operating expenses, market appreciation, and rental 
            income growth to give you a comprehensive view of your potential returns.
          </p>
          
          <h2 className="text-2xl font-bold mb-4 text-navy">Get Started</h2>
          <p>
            Head back to the <a href="/" className="text-seaBlue hover:underline">home page</a> and 
            start analyzing your first deal. No account required - your analyses are saved locally 
            on your device.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
'use client';

import React from 'react';
import { InvestmentStrategy } from './DealAnalyzer';

interface StrategySelectorProps {
  onStrategySelect: (strategy: InvestmentStrategy) => void;
}

interface StrategyCardProps {
  id: InvestmentStrategy;
  title: string;
  description: string;
  icon: React.ReactNode;
  onSelect: (strategy: InvestmentStrategy) => void;
}

// Strategy card component
const StrategyCard: React.FC<StrategyCardProps> = ({ 
  id, 
  title, 
  description, 
  icon, 
  onSelect 
}) => {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(id)}
    >
      <div className="flex items-center mb-4">
        <div className="bg-navy p-3 rounded-full text-white mr-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
        className="mt-4 py-2 px-4 bg-grass hover:bg-grass/90 text-white rounded-md font-medium transition-colors"
      >
        Select Strategy
      </button>
    </div>
  );
};

export default function StrategySelector({ onStrategySelect }: StrategySelectorProps) {
  const strategies = [
    {
      id: 'brrrr' as InvestmentStrategy,
      title: 'BRRRR',
      description: 'Buy, Rehab, Rent, Refinance, Repeat strategy for scaling a rental portfolio by recycling capital.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    {
      id: 'longTermRental' as InvestmentStrategy,
      title: 'Long-Term Rental',
      description: 'Traditional buy and hold strategy with consistent monthly rental income from long-term tenants.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'shortTermRental' as InvestmentStrategy,
      title: 'Short-Term Rental',
      description: 'Vacation rental or Airbnb property with higher income potential but more active management.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'multifamily' as InvestmentStrategy,
      title: 'Multi-Family',
      description: 'Properties with multiple units like duplexes, triplexes, and apartment buildings for scale.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'houseHack' as InvestmentStrategy,
      title: 'House Hack',
      description: 'Live in one unit while renting out others to offset your housing costs and build equity.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Investment Strategy</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Each real estate investment strategy has unique advantages and considerations. 
          Select the approach that aligns with your goals to begin your analysis.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {strategies.map(strategy => (
          <StrategyCard
            key={strategy.id}
            id={strategy.id}
            title={strategy.title}
            description={strategy.description}
            icon={strategy.icon}
            onSelect={onStrategySelect}
          />
        ))}
      </div>
      
      <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 mt-8">
        <h3 className="text-lg font-medium text-amber-800 mb-2">Strategy Selection Tips</h3>
        <ul className="list-disc list-inside text-amber-700 space-y-1">
          <li><strong>BRRRR</strong> - Best for recycling capital to scale your portfolio</li>
          <li><strong>Long-Term Rental</strong> - Ideal for steady, consistent income and less management</li>
          <li><strong>Short-Term Rental</strong> - Higher potential income, but requires more active management</li>
          <li><strong>Multi-Family</strong> - Great for scaling quickly and spreading risk across multiple units</li>
          <li><strong>House Hack</strong> - Perfect for beginners to offset personal housing costs while building equity</li>
        </ul>
      </div>
    </div>
  );
}
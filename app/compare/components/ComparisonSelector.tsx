'use client';

import React, { useState, useEffect } from 'react';
import { DealData } from '../dealAnalyzer/DealAnalyzer';

interface ComparisonSelectorProps {
  deals: DealData[];
  selectedDeals: string[];
  onDealSelect: (dealId: string) => void;
  onDealRemove: (dealId: string) => void;
  isLoading: boolean;
}

const ComparisonSelector: React.FC<ComparisonSelectorProps> = ({
  deals,
  selectedDeals,
  onDealSelect,
  onDealRemove,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDeals, setFilteredDeals] = useState<DealData[]>(deals);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDeals(deals);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      setFilteredDeals(
        deals.filter(
          deal => 
            deal.name?.toLowerCase().includes(lowercasedSearch) || 
            deal.address?.toLowerCase().includes(lowercasedSearch) ||
            deal.strategy.toLowerCase().includes(lowercasedSearch)
        )
      );
    }
  }, [searchTerm, deals]);
  
  const getStrategyDisplayName = (strategy: string): string => {
    const names: Record<string, string> = {
      brrrr: 'BRRRR',
      longTermRental: 'Long-Term Rental',
      shortTermRental: 'Short-Term Rental',
      multifamily: 'Multi-Family',
      houseHack: 'House Hack',
    };
    return names[strategy] || strategy;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-navy mb-4">Select Deals to Compare (up to 5)</h2>
      
      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search deals by name, address, or strategy..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Selected Deals Chips */}
      {selectedDeals.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm font-medium text-gray-500">Selected:</span>
          {selectedDeals.map(dealId => {
            const deal = deals.find(d => d.id === dealId);
            if (!deal) return null;
            
            return (
              <div key={dealId} className="inline-flex items-center bg-navy text-white px-3 py-1 rounded-full text-sm">
                <span>{deal.name || deal.address || 'Unnamed Deal'}</span>
                <button
                  onClick={() => onDealRemove(dealId)}
                  className="ml-2 focus:outline-none"
                  aria-label="Remove deal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Deal List */}
      <div className="border border-gray-200 rounded-md overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-navy"></div>
          </div>
        ) : filteredDeals.length > 0 ? (
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredDeals.map(deal => {
              const isSelected = selectedDeals.includes(deal.id);
              const isDisabled = selectedDeals.length >= 5 && !isSelected;
              
              return (
                <div 
                  key={deal.id}
                  className={`flex justify-between items-center p-4 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-navy/10' : ''
                  } ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!isDisabled || isSelected) {
                      if (isSelected) {
                        onDealRemove(deal.id);
                      } else {
                        onDealSelect(deal.id);
                      }
                    }
                  }}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{deal.name || deal.address || 'Unnamed Deal'}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="mr-3">{deal.address}</span>
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {getStrategyDisplayName(deal.strategy)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id={`select-${deal.id}`}
                        className="sr-only"
                        checked={isSelected}
                        onChange={() => {
                          if (!isDisabled || isSelected) {
                            if (isSelected) {
                              onDealRemove(deal.id);
                            } else {
                              onDealSelect(deal.id);
                            }
                          }
                        }}
                        disabled={isDisabled && !isSelected}
                      />
                      <label
                        htmlFor={`select-${deal.id}`}
                        className={`toggle-checkbox block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                          isDisabled && !isSelected ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <span
                          className={`toggle-dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                            isSelected ? 'transform translate-x-4 bg-green-500' : ''
                          }`}
                        ></span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No deals found matching your search criteria.</p>
          </div>
        )}
      </div>
      
      {/* Max Deals Warning */}
      {selectedDeals.length >= 5 && (
        <div className="mt-4 text-sm text-orange-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Maximum of 5 deals can be compared at once. Remove a deal to add another.
        </div>
      )}
    </div>
  );
};

export default ComparisonSelector;
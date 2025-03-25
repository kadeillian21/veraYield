'use client';

import React, { useState } from 'react';
import { DealData } from '../dealAnalyzer/DealAnalyzer';

// Now supports both the BRRRR calculator and the deal analyzer
interface PropertyInfoProps {
  dealData: DealData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateDealData: (updates: Partial<DealData>) => void;
}

export default function PropertyInfo({ dealData, updateDealData }: PropertyInfoProps) {
  const [addressFocused, setAddressFocused] = useState(false);
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Property Information</h3>
      
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <p className="brrrr-description mb-4">
          Start by entering the property address.
        </p>
        
        <div className="space-y-4">          
          <div>
            <label htmlFor="propertyAddress" className="brrrr-label">
              Property Address
            </label>
            <input
              type="text"
              id="propertyAddress"
              value={dealData.address}
              onChange={(e) => {
                // Update both the address and the name (using address as name)
                updateDealData({ 
                  address: e.target.value,
                  name: e.target.value 
                });
              }}
              onFocus={() => setAddressFocused(true)}
              onBlur={() => setAddressFocused(false)}
              className="brrrr-input"
              placeholder={addressFocused || dealData.address ? '' : 'e.g., 123 Main St, Anytown, USA'}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
        <h4 className="font-medium text-blue-900 mb-2">What is the BRRRR strategy?</h4>
        <p className="text-blue-800 mb-2">
          BRRRR stands for <strong>Buy, Rehab, Rent, Refinance, Repeat</strong>. It&apos;s a real estate investing strategy that allows you to build a rental portfolio with limited capital.
        </p>
        <ul className="list-disc list-inside text-blue-800 space-y-1">
          <li><strong>Buy</strong> - Purchase a property below market value</li>
          <li><strong>Rehab</strong> - Renovate to increase the property value</li>
          <li><strong>Rent</strong> - Place quality tenants to generate cash flow</li>
          <li><strong>Refinance</strong> - Pull out equity through a cash-out refinance</li>
          <li><strong>Repeat</strong> - Use the cash-out funds to start again with a new property</li>
        </ul>
      </div>
    </div>
  );
}
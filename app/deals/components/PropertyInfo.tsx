'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Deal } from '../models';
import { useDebounce } from 'use-debounce';

// Interfaces for the autocomplete API responses
interface Prediction {
  description: string;
  place_id: string;
}

interface AutocompleteResponse {
  predictions: Prediction[];
  error?: string;
}

interface PlaceDetailsResponse {
  formatted_address: string | null;
  error?: string;
}

// Now supports both the BRRRR calculator and the deal analyzer
interface PropertyInfoProps {
  dealData: Deal;
  updateDealData: (updates: Partial<Deal>) => void;
}

export default function PropertyInfo({ dealData, updateDealData }: PropertyInfoProps) {
  const [addressFocused, setAddressFocused] = useState(false);
  const [inputValue, setInputValue] = useState(dealData.address || '');
  const [debouncedInput] = useDebounce(inputValue, 300); // Debounce input to avoid excessive API calls
  const [suggestions, setSuggestions] = useState<Prediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Fetch address suggestions when input changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedInput || debouncedInput.length < 3) {
        setSuggestions([]);
        return;
      }
      
      setIsLoading(true);
      setErrorMessage('');
      
      try {
        const response = await fetch(
          `/api/maps-proxy?input=${encodeURIComponent(debouncedInput)}`
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch suggestions');
        }
        
        const data: AutocompleteResponse = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setSuggestions(data.predictions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuggestions();
  }, [debouncedInput]);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle selecting a suggestion
  const handleSelectSuggestion = async (prediction: Prediction) => {
    setShowSuggestions(false);
    setInputValue(prediction.description);
    
    // Update the dealData with the selected address
    updateDealData({
      address: prediction.description,
      name: prediction.description
    });
    
    // Fetch place details to get proper formatted address
    try {
      const response = await fetch(
        `/api/maps-proxy/place-details?place_id=${prediction.place_id}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch place details');
      }
      
      const data: PlaceDetailsResponse = await response.json();
      
      if (data.formatted_address) {
        setInputValue(data.formatted_address);
        updateDealData({
          address: data.formatted_address,
          name: data.formatted_address
        });
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      // Continue with the prediction description if details fetch fails
    }
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Update the address in dealData as the user types
    updateDealData({
      address: newValue,
      name: newValue
    });
    
    if (newValue.length >= 3) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Property Information</h3>
      
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <p className="brrrr-description mb-4">
          Start by entering the property address.
        </p>
        
        <div className="space-y-4">          
          <div className="relative">
            <label htmlFor="propertyAddress" className="brrrr-label">
              Property Address
            </label>
            
            <input
              type="text"
              id="propertyAddress"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => {
                setAddressFocused(true);
                if (inputValue.length >= 3) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => setAddressFocused(false)}
              className="brrrr-input"
              placeholder={addressFocused || inputValue ? '' : 'e.g., 123 Main St, Anytown, USA'}
              autoComplete="off"
            />
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute right-3 top-9">
                <div className="animate-spin h-5 w-5 border-2 border-navy border-t-transparent rounded-full"></div>
              </div>
            )}
            
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto"
              >
                <ul className="py-1">
                  {suggestions.map((prediction) => (
                    <li
                      key={prediction.place_id}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onMouseDown={() => handleSelectSuggestion(prediction)}
                    >
                      {prediction.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Error message */}
            {errorMessage && (
              <p className="mt-1 text-xs text-red-500">
                {errorMessage}
              </p>
            )}
            
            <p className="mt-1 text-xs text-gray-500">
              Type to see address suggestions or enter any address. You don't need to use a real address.
            </p>
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
'use client';

import React, { useState } from 'react';

interface PercentageInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function PercentageInput({ 
  value, 
  onChange, 
  placeholder = '0.0',
  disabled = false
}: PercentageInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState<string>(value ? (value * 100).toFixed(2) : '');
  
  // Handle direct changes to the input value
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Allow empty input for clearing the field
    if (rawValue === '') {
      setInputValue('');
      onChange(0);
      return;
    }
    
    // Allow only numbers and decimal point
    const sanitizedValue = rawValue.replace(/[^0-9.]/g, '');
    
    // Only update if it's a valid number
    if (sanitizedValue === '' || !isNaN(parseFloat(sanitizedValue))) {
      setInputValue(sanitizedValue);
      
      // Convert percentage to decimal (e.g., 5.75 -> 0.0575)
      const numericValue = sanitizedValue ? parseFloat(sanitizedValue) / 100 : 0;
      
      // Update parent component
      onChange(numericValue);
    }
  };
  
  // Update local input value when the parent value changes
  React.useEffect(() => {
    if (!isFocused) {
      setInputValue(value ? (value * 100).toFixed(2) : '');
    }
  }, [value, isFocused]);
  
  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={isFocused || inputValue ? '' : placeholder}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          // If field is empty on blur, ensure it's set to 0
          if (inputValue === '') {
            onChange(0);
          }
        }}
        className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-md focus:ring-navy focus:border-navy text-gray-900 font-medium placeholder:text-gray-500"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700">
        %
      </span>
    </div>
  );
}
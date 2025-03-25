'use client';

import React, { useState } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CurrencyInput({ 
  value, 
  onChange, 
  placeholder = '0.00',
  disabled = false
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState<string>(value ? value.toString() : '');
  
  // Handle direct changes to the input value
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Allow empty input for clearing the field
    if (rawValue === '') {
      setInputValue('');
      onChange(0);
      return;
    }
    
    // Remove non-numeric characters
    const sanitizedValue = rawValue.replace(/[^0-9]/g, '');
    setInputValue(sanitizedValue);
    
    // Convert to number
    const numericValue = sanitizedValue ? parseInt(sanitizedValue) : 0;
    
    // Update parent component
    onChange(numericValue);
  };
  
  // Update local input value when the parent value changes
  React.useEffect(() => {
    if (!isFocused) {
      setInputValue(value ? value.toString() : '');
    }
  }, [value, isFocused]);
  
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700">
        $
      </span>
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
        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-navy focus:border-navy text-gray-900 font-medium placeholder:text-gray-500"
      />
    </div>
  );
}
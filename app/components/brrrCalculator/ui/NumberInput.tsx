'use client';

import React, { useState, useEffect } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  suffix?: string;
  disabled?: boolean;
  className?: string;
}

export default function NumberInput({ 
  value, 
  onChange, 
  placeholder = '0',
  min,
  max,
  suffix,
  disabled = false,
  className = ''
}: NumberInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState<string>(value?.toString() || '');
  
  // Handle direct changes to the input value
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Allow empty input for clearing the field
    if (rawValue === '') {
      setInputValue('');
      return;
    }
    
    // Only allow numeric input and ensure it's within min/max bounds
    const sanitizedValue = rawValue.replace(/[^0-9]/g, '');
    
    if (sanitizedValue === '' || !isNaN(parseInt(sanitizedValue))) {
      setInputValue(sanitizedValue);
      
      const numericValue = parseInt(sanitizedValue);
      
      // Only update parent if the value is valid and within bounds
      if (!isNaN(numericValue)) {
        // Apply min/max constraints only when updating the parent component
        let constrainedValue = numericValue;
        
        if (min !== undefined && numericValue < min) {
          constrainedValue = min;
        } else if (max !== undefined && numericValue > max) {
          constrainedValue = max;
        }
        
        onChange(constrainedValue);
      }
    }
  };
  
  // Update local input value when the parent value changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value?.toString() || '');
    }
  }, [value, isFocused]);
  
  // Handle blur with min/max constraints
  const handleBlur = () => {
    setIsFocused(false);
    
    // If field is empty on blur, default to min value or 0
    if (inputValue === '') {
      const defaultValue = min !== undefined ? min : 0;
      setInputValue(defaultValue.toString());
      onChange(defaultValue);
      return;
    }
    
    // Apply constraints on blur
    const numericValue = parseInt(inputValue);
    let constrainedValue = numericValue;
    
    if (min !== undefined && numericValue < min) {
      constrainedValue = min;
      setInputValue(min.toString());
    } else if (max !== undefined && numericValue > max) {
      constrainedValue = max;
      setInputValue(max.toString());
    }
    
    onChange(constrainedValue);
  };
  
  const baseClassName = "p-2 border border-gray-300 rounded-md focus:ring-navy focus:border-navy text-gray-900 font-medium placeholder:text-gray-500";
  const finalClassName = suffix ? `${baseClassName} ${className} pr-8` : `${baseClassName} ${className}`;
  
  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={isFocused || inputValue ? '' : placeholder}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        className={finalClassName}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700">
          {suffix}
        </span>
      )}
    </div>
  );
}
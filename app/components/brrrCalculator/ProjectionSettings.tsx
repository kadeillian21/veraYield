'use client';

import React, { useState, useEffect } from 'react';
import { 
  PropertyValueChangeEvent,
  RentChangeEvent,
  ExpenseChangeEvent,
  RefinanceEvent 
} from '../../utils/brrrCalculator/projectionEngine';
import PercentageInput from './ui/PercentageInput';
import NumberInput from './ui/NumberInput';

interface ProjectionSettingsProps {
  projectionMonths: number;
  updateProjectionMonths: (months: number) => void;
  propertyValueChanges: PropertyValueChangeEvent[];
  updatePropertyValueChanges: (events: PropertyValueChangeEvent[]) => void;
  rentChangeEvents: RentChangeEvent[];
  updateRentChangeEvents: (events: RentChangeEvent[]) => void;
  expenseChangeEvents: ExpenseChangeEvent[];
  updateExpenseChangeEvents: (events: ExpenseChangeEvent[]) => void;
  initialMonthlyRent: number;
  annualExpenseAppreciationRate?: number;
  updateExpenseAppreciationRate?: (rate: number) => void;
  refinanceEvents?: RefinanceEvent[];
}

export default function ProjectionSettings({
  projectionMonths,
  updateProjectionMonths,
  updatePropertyValueChanges,
  updateRentChangeEvents,
  annualExpenseAppreciationRate = 0.02,
  updateExpenseAppreciationRate
}: ProjectionSettingsProps) {
  // Set default appreciation rates
  const [propertyAppreciationRate, setPropertyAppreciationRate] = useState(0.03); // 3% default
  const [rentIncreaseRate, setRentIncreaseRate] = useState(0.03); // 3% default
  const [expenseIncreaseRate, setExpenseIncreaseRate] = useState(annualExpenseAppreciationRate); // From props
  
  // Apply property appreciation rate to the config when changed
  useEffect(() => {
    // Create a placeholder event to store the rate
    const rateEvent: PropertyValueChangeEvent = {
      month: 0, // Special marker to indicate this is a global rate
      newValue: propertyAppreciationRate 
    };
    
    // Start with just this event
    const events = [rateEvent];
    updatePropertyValueChanges(events);
  }, [propertyAppreciationRate, updatePropertyValueChanges]);
  
  // Apply rent increase rate to the config when changed
  useEffect(() => {
    // Create a placeholder event to store the rate
    const rateEvent: RentChangeEvent = {
      month: 0, // Special marker to indicate this is a global rate
      newRent: rentIncreaseRate
    };
    
    // Start with just this event
    const events = [rateEvent];
    updateRentChangeEvents(events);
  }, [rentIncreaseRate, updateRentChangeEvents]);
  
  // Update expense appreciation rate in parent when changed locally
  useEffect(() => {
    if (updateExpenseAppreciationRate) {
      updateExpenseAppreciationRate(expenseIncreaseRate);
    }
  }, [expenseIncreaseRate, updateExpenseAppreciationRate]);
  
  // Update local state when props change
  useEffect(() => {
    setExpenseIncreaseRate(annualExpenseAppreciationRate);
  }, [annualExpenseAppreciationRate]);
  
  // Years and months conversion
  const projectionYears = Math.ceil(projectionMonths / 12);
  
  // Convert years to months
  const yearsToMonths = (years: number): number => years * 12;

  // Predefined projection lengths in years
  const projectionOptions = [
    { label: '1 Year', value: 1 },
    { label: '2 Years', value: 2 },
    { label: '5 Years', value: 5 },
    { label: '10 Years', value: 10 },
    { label: '20 Years', value: 20 },
    { label: '30 Years', value: 30 },
    { label: '50 Years', value: 50 }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-black mb-4">Projection Settings</h3>
      
      {/* Projection Length */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">
        <h4 className="text-lg font-medium text-black">Projection Length</h4>
        <p className="text-sm text-black mb-4">
          Choose how many years to project your real estate investment financials.
        </p>
        
        <div className="flex flex-wrap gap-2">
          {projectionOptions.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateProjectionMonths(yearsToMonths(option.value))}
              className={`py-2 px-4 rounded-md transition-colors ${
                projectionYears === option.value
                  ? 'bg-navy text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-black'
              }`}
            >
              {option.label}
            </button>
          ))}
          
          <div className="flex items-center ml-2">
            <span className="mr-2 text-black">Custom:</span>
            <NumberInput
              min={1}
              max={100}
              value={projectionYears}
              onChange={(years) => updateProjectionMonths(yearsToMonths(years))}
              className="w-24"
            />
            <span className="ml-2 text-black">years</span>
          </div>
        </div>
      </div>
      
      {/* Property Value Changes */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">
        <h4 className="text-lg font-medium text-black">Property Appreciation</h4>
        
        <p className="text-sm text-black mb-4">
          Set a fixed annual percentage rate that property values will increase each year throughout the entire projection period.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center">
            <div>
              <label className="block font-medium text-black mb-1">
                Annual Property Appreciation Rate
              </label>
              <PercentageInput
                value={propertyAppreciationRate}
                onChange={(value) => {
                  setPropertyAppreciationRate(value);
                }}
                placeholder="3.0"
              />
            </div>
            
            <div className="md:ml-8 mt-4 md:mt-0">
              <p className="font-medium text-black">What this means:</p>
              <ul className="list-disc list-inside text-sm mt-1 space-y-1 text-black">
                <li>Property value will increase by {(propertyAppreciationRate * 100).toFixed(1)}% each year</li>
                <li>Typical range: 2-3% (in line with inflation)</li>
                <li>This rate applies continuously for the entire projection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rent Changes */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">
        <h4 className="text-lg font-medium text-black">Rent Increases</h4>
        
        <p className="text-sm text-black mb-4">
          Set a fixed annual percentage rate that rents will increase each year throughout the entire projection period.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center">
            <div>
              <label className="block font-medium text-black mb-1">
                Annual Rent Increase Rate
              </label>
              <PercentageInput
                value={rentIncreaseRate}
                onChange={(value) => {
                  setRentIncreaseRate(value);
                }}
                placeholder="3.0"
              />
            </div>
            
            <div className="md:ml-8 mt-4 md:mt-0">
              <p className="font-medium text-black">What this means:</p>
              <ul className="list-disc list-inside text-sm mt-1 space-y-1 text-black">
                <li>Rent will increase by {(rentIncreaseRate * 100).toFixed(1)}% each year</li>
                <li>Typical range: 2-3% (in line with inflation)</li>
                <li>This rate applies continuously for the entire projection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Global Expense Appreciation */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">
        <h4 className="text-lg font-medium text-black">Operating Expense Appreciation</h4>
        
        <p className="text-sm text-black mb-4">
          Set an annual percentage increase for all operating expenses (property taxes, insurance, maintenance, utilities, etc.).
          This models how expenses typically increase over time due to inflation and other factors.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center">
            <div>
              <label className="block font-medium text-black mb-1">
                Annual Expense Appreciation Rate
              </label>
              <div className="flex items-center">
                <PercentageInput
                  value={expenseIncreaseRate}
                  onChange={setExpenseIncreaseRate}
                  placeholder="2.0"
                />
                <span className="ml-2 text-black">per year</span>
              </div>
            </div>
            
            <div className="md:ml-8 mt-4 md:mt-0">
              <p className="font-medium text-black">What this means:</p>
              <ul className="list-disc list-inside text-sm mt-1 space-y-1 text-black">
                <li>All operating expenses will increase by {(expenseIncreaseRate * 100).toFixed(1)}% each year</li>
                <li>Typical range: 2-3% (follows inflation)</li>
                <li>Does not affect mortgage payments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Projection Tips */}
      <div className="bg-emerald-50 p-6 rounded-lg shadow-sm border border-emerald-100">
        <h4 className="text-lg font-medium text-black mb-2">Projection Tips</h4>
        
        <ul className="list-disc list-inside text-black space-y-1">
          <li>
            For a comprehensive view of long-term investment performance, consider projecting 20-30 years
          </li>
          <li>
            For conservative property value projections, use 2-3% annual appreciation (or local historical averages)
          </li>
          <li>
            Rent increases typically follow inflation (2-3% annually), but can vary by market
          </li>
          <li>
            Expense appreciation of 2% reflects general inflation for property operating costs
          </li>
          <li>
            For retirement planning, long-term projections (30+ years) can be valuable
          </li>
        </ul>
      </div>
    </div>
  );
}
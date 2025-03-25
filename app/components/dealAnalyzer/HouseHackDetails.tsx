'use client';

import React, { useState } from 'react';
import CurrencyInput from '../brrrCalculator/ui/CurrencyInput';
import PercentageInput from '../brrrCalculator/ui/PercentageInput';
import NumberInput from '../brrrCalculator/ui/NumberInput';
import { RentalUnit } from './MultiFamilyUnits';

export interface HouseHackConfiguration {
  // Owner's living details
  ownerUnit: {
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    marketRent: number; // What you could rent it for
    personalUsage: number; // Percentage of personal use
    occupancyRate?: number; // Used when moving out
  };
  // Owner's expenses
  currentHousingCost: number; // Current monthly rent or housing payment
  personalUtilities: number;
  combinedUtilities: number; // Utilities for the entire property
  combinedInsurance: number; // Insurance for the entire property
  combinedPropertyTax: number; // Property tax for the entire property
  
  // Additional rental units
  rentalUnits: RentalUnit[];
  
  // Future plans
  futurePlan: 'stay' | 'move-out' | 'sell'; // What to do after first year
  futurePropertyValueChange: number; // Percentage
  futureDateOfChange: number; // Months in future
  
  // Property value reference
  purchasePrice?: number; // Property purchase price for equity calculations
}

interface HouseHackDetailsProps {
  houseHack: HouseHackConfiguration;
  updateHouseHack: (config: HouseHackConfiguration) => void;
}

export default function HouseHackDetails({ 
  houseHack, 
  updateHouseHack 
}: HouseHackDetailsProps) {
  // State for new rental unit
  const [newUnit, setNewUnit] = useState<Omit<RentalUnit, 'id'>>({
    unitNumber: '',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 800,
    monthlyRent: 0,
    occupancyRate: 95
  });

  // Generate ID for new units
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  // Helper to update the owner's unit fields
  const updateOwnerUnitField = <K extends keyof HouseHackConfiguration['ownerUnit']>(
    field: K, 
    value: HouseHackConfiguration['ownerUnit'][K]
  ) => {
    updateHouseHack({
      ...houseHack,
      ownerUnit: {
        ...houseHack.ownerUnit,
        [field]: value
      }
    });
  };

  // Helper to update a property outside the owner's unit
  const updateField = <K extends keyof Omit<HouseHackConfiguration, 'ownerUnit' | 'rentalUnits'>>(
    field: K, 
    value: HouseHackConfiguration[K]
  ) => {
    updateHouseHack({
      ...houseHack,
      [field]: value
    });
  };

  // Add a new rental unit
  const addRentalUnit = () => {
    if (!newUnit.unitNumber || newUnit.monthlyRent <= 0) return;
    
    const updatedUnits = [
      ...houseHack.rentalUnits,
      {
        ...newUnit,
        id: generateId()
      }
    ];
    
    // Sort by unit number
    updatedUnits.sort((a, b) => a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true }));
    
    updateHouseHack({
      ...houseHack,
      rentalUnits: updatedUnits
    });
    
    // Reset form but keep some fields for ease of entry
    setNewUnit({
      unitNumber: String(Number(newUnit.unitNumber) + 1), // Increment unit number if numeric
      bedrooms: newUnit.bedrooms,
      bathrooms: newUnit.bathrooms,
      sqft: newUnit.sqft,
      monthlyRent: 0,
      occupancyRate: 95
    });
  };

  // Update a specific rental unit
  const updateRentalUnit = (id: string, field: keyof RentalUnit, value: number | string) => {
    const updatedUnits = houseHack.rentalUnits.map(unit => {
      if (unit.id === id) {
        return {
          ...unit,
          [field]: value
        };
      }
      return unit;
    });
    
    updateHouseHack({
      ...houseHack,
      rentalUnits: updatedUnits
    });
  };

  // Remove a rental unit
  const removeRentalUnit = (id: string) => {
    const updatedUnits = houseHack.rentalUnits.filter(unit => unit.id !== id);
    
    updateHouseHack({
      ...houseHack,
      rentalUnits: updatedUnits
    });
  };

  // Calculate financial summary
  const calculateFinancials = () => {
    // Rental income calculation with vacancies
    const rentalIncome = houseHack.rentalUnits.reduce((sum, unit) => {
      return sum + (unit.monthlyRent * (unit.occupancyRate / 100));
    }, 0);
    
    // Owner-occupied unit calculations
    const ownerUnitMarketRent = houseHack.ownerUnit.marketRent;
    const ownerUnitPersonalCost = ownerUnitMarketRent * (houseHack.ownerUnit.personalUsage / 100);
    
    // Total expense calculations
    const totalUtilities = houseHack.personalUtilities + houseHack.combinedUtilities;
    const totalMonthlyExpenses = 
      (houseHack.combinedInsurance / 12) + 
      (houseHack.combinedPropertyTax / 12) + 
      totalUtilities;
    
    // Cash flow calculations
    const grossIncome = rentalIncome;
    const netHousingCost = ownerUnitPersonalCost + totalMonthlyExpenses - grossIncome;
    const housingCostSavings = houseHack.currentHousingCost - netHousingCost;
    
    // House hacking metrics
    const isCashFlowPositive = netHousingCost < 0;
    const percentSavings = (housingCostSavings / houseHack.currentHousingCost) * 100;
    
    return {
      rentalIncome,
      ownerUnitMarketRent,
      ownerUnitPersonalCost, 
      totalUtilities,
      totalMonthlyExpenses,
      grossIncome,
      netHousingCost,
      housingCostSavings,
      isCashFlowPositive,
      percentSavings
    };
  };

  // Calculate future outcomes based on the selected plan
  const calculateFutureOutcomes = () => {
    const financials = calculateFinancials();
    
    // Calculate monthly value of staying (savings compared to previous housing)
    const monthlyValueOfStaying = financials.housingCostSavings;
    
    // Calculate annualized value
    const annualValueOfStaying = monthlyValueOfStaying * 12;
    
    // Owner unit market rent if moving out
    const futureOwnerUnitIncome = houseHack.ownerUnit.marketRent * (houseHack.ownerUnit.occupancyRate || 95) / 100;
    
    // Calculate future property value
    const purchasePrice = houseHack.purchasePrice || 0;
    const futurePropertyValue = purchasePrice * (1 + (houseHack.futurePropertyValueChange / 100));
    
    // Selling costs (est. 6% of sale price)
    const sellingCosts = futurePropertyValue * 0.06;
    
    // Calculate equity gain
    const equityGain = futurePropertyValue - purchasePrice - sellingCosts;
    
    return {
      monthlyValueOfStaying,
      annualValueOfStaying,
      futureOwnerUnitIncome,
      futurePropertyValue,
      sellingCosts,
      equityGain
    };
  };

  const financials = calculateFinancials();
  const futureOutcomes = calculateFutureOutcomes();

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">House Hack Details</h3>
      
      {/* Current Housing Costs */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Current Housing Costs</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Monthly Housing Cost
            </label>
            <CurrencyInput
              value={houseHack.currentHousingCost}
              onChange={(value) => updateField('currentHousingCost', value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Rent or mortgage you&apos;re currently paying
            </p>
          </div>
        </div>
      </div>
      
      {/* Your Unit Details */}
      <div className="bg-indigo-50 p-6 rounded-lg shadow-sm border border-indigo-100">
        <h4 className="text-lg font-medium text-indigo-800 mb-4">Your Unit Details</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-indigo-700 mb-1">
              Unit Number/Label
            </label>
            <input
              type="text"
              value={houseHack.ownerUnit.unitNumber}
              onChange={(e) => updateOwnerUnitField('unitNumber', e.target.value)}
              className="w-full p-2 border border-indigo-200 rounded-md"
              placeholder="e.g., A, 1, Main"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-indigo-700 mb-1">
              Bedrooms
            </label>
            <NumberInput
              value={houseHack.ownerUnit.bedrooms}
              min={0}
              max={10}
              onChange={(value) => updateOwnerUnitField('bedrooms', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-indigo-700 mb-1">
              Bathrooms
            </label>
            <NumberInput
              value={houseHack.ownerUnit.bathrooms}
              min={0.5}
              max={10}
              onChange={(value) => updateOwnerUnitField('bathrooms', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-indigo-700 mb-1">
              Square Footage
            </label>
            <NumberInput
              value={houseHack.ownerUnit.sqft}
              min={0}
              max={10000}
              onChange={(value) => updateOwnerUnitField('sqft', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-indigo-700 mb-1">
              Market Rent Value
            </label>
            <CurrencyInput
              value={houseHack.ownerUnit.marketRent}
              onChange={(value) => updateOwnerUnitField('marketRent', value)}
            />
            <p className="text-xs text-indigo-600 mt-1">
              What you could rent this unit for
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-indigo-700 mb-1">
              Personal Usage (%)
            </label>
            <PercentageInput
              value={houseHack.ownerUnit.personalUsage / 100}
              onChange={(value) => updateOwnerUnitField('personalUsage', value * 100)}
            />
            <p className="text-xs text-indigo-600 mt-1">
              For partial business use of your unit
            </p>
          </div>
        </div>
        
        <div className="mt-4 bg-white p-4 rounded-md border border-indigo-200">
          <h5 className="font-medium text-indigo-800 mb-2">Your Personal Expenses</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">
                Personal Utilities
              </label>
              <CurrencyInput
                value={houseHack.personalUtilities}
                onChange={(value) => updateField('personalUtilities', value)}
              />
              <p className="text-xs text-indigo-600 mt-1">
                Utilities you pay separately
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Property-Wide Expenses */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Property-Wide Expenses</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Combined Monthly Utilities
            </label>
            <CurrencyInput
              value={houseHack.combinedUtilities}
              onChange={(value) => updateField('combinedUtilities', value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Shared utilities for entire property
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Property Insurance
            </label>
            <CurrencyInput
              value={houseHack.combinedInsurance}
              onChange={(value) => updateField('combinedInsurance', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Property Taxes
            </label>
            <CurrencyInput
              value={houseHack.combinedPropertyTax}
              onChange={(value) => updateField('combinedPropertyTax', value)}
            />
          </div>
        </div>
      </div>
      
      {/* Rental Units */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-gray-800 mb-4">
          Rental Units {houseHack.rentalUnits.length > 0 && `(${houseHack.rentalUnits.length} Units)`}
        </h4>
        
        {/* Add New Rental Unit Form */}
        <div className="bg-white p-4 rounded-md border border-gray-200 mb-6">
          <h5 className="font-medium text-gray-800 mb-3">Add New Rental Unit</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit #
              </label>
              <input
                type="text"
                value={newUnit.unitNumber}
                onChange={(e) => setNewUnit({ ...newUnit, unitNumber: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="B"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beds
              </label>
              <NumberInput
                value={newUnit.bedrooms}
                min={0}
                max={10}
                onChange={(value) => setNewUnit({ ...newUnit, bedrooms: value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Baths
              </label>
              <NumberInput
                value={newUnit.bathrooms}
                min={0.5}
                max={10}
                onChange={(value) => setNewUnit({ ...newUnit, bathrooms: value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sq. Ft.
              </label>
              <NumberInput
                value={newUnit.sqft}
                min={0}
                max={10000}
                onChange={(value) => setNewUnit({ ...newUnit, sqft: value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rent
              </label>
              <CurrencyInput
                value={newUnit.monthlyRent}
                onChange={(value) => setNewUnit({ ...newUnit, monthlyRent: value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occupancy Rate
              </label>
              <PercentageInput
                value={newUnit.occupancyRate / 100}
                onChange={(value) => setNewUnit({ ...newUnit, occupancyRate: value * 100 })}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <button
              type="button"
              onClick={addRentalUnit}
              disabled={!newUnit.unitNumber || newUnit.monthlyRent <= 0}
              className={`py-2 px-4 rounded-md ${
                !newUnit.unitNumber || newUnit.monthlyRent <= 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-grass text-white hover:bg-grass/90'
              }`}
            >
              Add Rental Unit
            </button>
          </div>
        </div>
        
        {/* Rental Units List */}
        {houseHack.rentalUnits.length === 0 ? (
          <div className="bg-gray-100 p-8 rounded-md text-center text-gray-500">
            <p>No rental units added yet. Add rental units using the form above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Unit #
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Monthly Rent
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Occupancy
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Effective Rent
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {houseHack.rentalUnits.map((unit) => (
                  <tr key={unit.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{unit.unitNumber}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {unit.bedrooms} BD / {unit.bathrooms} BA ({unit.sqft} sqft)
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <CurrencyInput
                          value={unit.monthlyRent}
                          onChange={(value) => updateRentalUnit(unit.id, 'monthlyRent', value)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 w-24">
                        <PercentageInput
                          value={unit.occupancyRate / 100}
                          onChange={(value) => updateRentalUnit(unit.id, 'occupancyRate', value * 100)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${Math.round(unit.monthlyRent * (unit.occupancyRate / 100)).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => removeRentalUnit(unit.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Future Plans */}
      <div className="bg-purple-50 p-6 rounded-lg shadow-sm border border-purple-100">
        <h4 className="text-lg font-medium text-purple-800 mb-4">Future Plans</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-800 mb-2">
              What&apos;s your plan after the first year?
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => updateField('futurePlan', 'stay')}
                className={`py-2 px-4 rounded-md transition-colors ${
                  houseHack.futurePlan === 'stay'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-purple-800 border border-purple-300'
                }`}
              >
                Continue Living There
              </button>
              <button
                type="button"
                onClick={() => updateField('futurePlan', 'move-out')}
                className={`py-2 px-4 rounded-md transition-colors ${
                  houseHack.futurePlan === 'move-out'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-purple-800 border border-purple-300'
                }`}
              >
                Move Out & Rent Your Unit
              </button>
              <button
                type="button"
                onClick={() => updateField('futurePlan', 'sell')}
                className={`py-2 px-4 rounded-md transition-colors ${
                  houseHack.futurePlan === 'sell'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-purple-800 border border-purple-300'
                }`}
              >
                Sell the Property
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-1">
                Estimated Property Value Change (%)
              </label>
              <PercentageInput
                value={houseHack.futurePropertyValueChange / 100}
                onChange={(value) => updateField('futurePropertyValueChange', value * 100)}
              />
              <p className="text-xs text-purple-600 mt-1">
                Annual appreciation or depreciation
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-1">
                Months Until Change
              </label>
              <NumberInput
                value={houseHack.futureDateOfChange}
                min={1}
                max={60}
                onChange={(value) => updateField('futureDateOfChange', value)}
              />
              <p className="text-xs text-purple-600 mt-1">
                When you plan to make this change
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Financial Summary */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-100">
        <h4 className="text-lg font-medium text-green-800 mb-4">House Hack Financial Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
            <h5 className="font-medium text-green-800 mb-3">Monthly Cash Flow</h5>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Current Housing Cost:</span>
                <span className="text-lg font-medium text-gray-900">
                  ${houseHack.currentHousingCost.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Your Unit &quot;Rent&quot; Cost:</span>
                <span className="text-lg font-medium text-gray-900">
                  ${Math.round(financials.ownerUnitPersonalCost).toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-green-700">
                <span>Rental Income:</span>
                <span className="font-semibold">
                  ${Math.round(financials.rentalIncome).toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-red-700">
                <span>Total Monthly Expenses:</span>
                <span className="font-semibold">
                  -${Math.round(financials.totalMonthlyExpenses).toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Net Housing Cost:</span>
                <span className={`text-lg font-bold ${financials.netHousingCost < 0 ? 'text-green-600' : 'text-blue-600'}`}>
                  ${Math.round(financials.netHousingCost).toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-green-200">
                <span className="text-lg font-semibold text-green-700">Monthly Savings:</span>
                <span className="text-xl font-bold text-green-700">
                  ${Math.round(financials.housingCostSavings).toLocaleString()}
                </span>
              </div>
              
              <div className="bg-green-100 p-3 rounded-md">
                <span className="text-sm text-green-800">
                  Compared to your current housing costs, you&apos;re saving 
                  <span className="font-bold"> {Math.round(financials.percentSavings)}% </span> 
                  with this house hack!
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
            <h5 className="font-medium text-green-800 mb-3">Future Outcomes</h5>
            
            <div className="space-y-4">
              {houseHack.futurePlan === 'stay' && (
                <div>
                  <h6 className="font-medium text-gray-800 mb-2">Continuing to Live in Your Unit</h6>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Annual Housing Savings:</span>
                      <span className="font-semibold text-green-700">
                        ${Math.round(futureOutcomes.annualValueOfStaying).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">5-Year Housing Savings:</span>
                      <span className="font-semibold text-green-700">
                        ${Math.round(futureOutcomes.annualValueOfStaying * 5).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {houseHack.futurePlan === 'move-out' && (
                <div>
                  <h6 className="font-medium text-gray-800 mb-2">Moving Out & Renting Your Unit</h6>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Additional Monthly Income:</span>
                      <span className="font-semibold text-green-700">
                        ${Math.round(futureOutcomes.futureOwnerUnitIncome).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total Monthly Rental Income:</span>
                      <span className="font-semibold text-green-700">
                        ${Math.round(futureOutcomes.futureOwnerUnitIncome + financials.rentalIncome).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {houseHack.futurePlan === 'sell' && (
                <div>
                  <h6 className="font-medium text-gray-800 mb-2">Selling the Property</h6>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Estimated Future Value:</span>
                      <span className="font-semibold text-gray-900">
                        ${Math.round(futureOutcomes.futurePropertyValue).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Selling Costs (6%):</span>
                      <span className="font-semibold text-red-600">
                        -${Math.round(futureOutcomes.sellingCosts).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-700">Estimated Equity Gain:</span>
                      <span className="font-semibold text-green-700">
                        ${Math.round(futureOutcomes.equityGain).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-purple-100 p-3 rounded-md mt-4">
                <h6 className="font-medium text-purple-800 mb-1">Total First Year Value</h6>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-purple-700">Housing Cost Savings:</span>
                    <span className="font-semibold text-purple-800">
                      ${Math.round(financials.housingCostSavings * 12).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Potential Equity Gain:</span>
                    <span className="font-semibold text-purple-800">
                      ${Math.round((houseHack.purchasePrice || 0) * (houseHack.futurePropertyValueChange / 100)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-purple-200">
                    <span className="font-medium text-purple-800">Total First Year Benefit:</span>
                    <span className="font-bold text-purple-800">
                      ${Math.round((financials.housingCostSavings * 12) + ((houseHack.purchasePrice || 0) * (houseHack.futurePropertyValueChange / 100))).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* House Hacking Tips */}
      <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
        <h4 className="text-lg font-medium text-amber-800 mb-2">House Hacking Tips</h4>
        
        <ul className="list-disc list-inside text-amber-700 space-y-1">
          <li>Consider owner-occupied financing options like FHA or VA loans (3.5-5% down)</li>
          <li>Look for properties with separate entrances for privacy</li>
          <li>Factor in time for landlord responsibilities when self-managing</li>
          <li>Budget for furnishing costs if renting units furnished</li>
          <li>Check local zoning laws to ensure multi-unit rentals are permitted</li>
        </ul>
      </div>
    </div>
  );
}
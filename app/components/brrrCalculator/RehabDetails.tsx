'use client';

import React, { useState } from 'react';
import { PropertyAcquisition, HoldingCosts, CapitalExpenseEvent } from '../../utils/brrrCalculator/projectionEngine';
import CurrencyInput from './ui/CurrencyInput';
import NumberInput from './ui/NumberInput';

interface RehabDetailsProps {
  acquisition: PropertyAcquisition;
  updateAcquisition: (acquisition: PropertyAcquisition) => void;
  capitalExpenses: CapitalExpenseEvent[];
  updateCapitalExpenses: (capitalExpenses: CapitalExpenseEvent[]) => void;
}

export default function RehabDetails({
  acquisition,
  updateAcquisition
}: RehabDetailsProps) {
  
  // State for holding costs
  const [holdingCosts, setHoldingCosts] = useState<HoldingCosts>({
    mortgage: acquisition.includeHoldingCosts?.mortgage ?? true,
    taxes: acquisition.includeHoldingCosts?.taxes ?? true,
    insurance: acquisition.includeHoldingCosts?.insurance ?? true,
    maintenance: acquisition.includeHoldingCosts?.maintenance ?? false,
    propertyManagement: acquisition.includeHoldingCosts?.propertyManagement ?? false,
    utilities: acquisition.includeHoldingCosts?.utilities ?? true,
    other: acquisition.includeHoldingCosts?.other ?? false
  });

  // Helper to update a specific field in acquisition
  const updateField = (field: keyof PropertyAcquisition, value: number | boolean | Record<string, boolean> | undefined) => {
    updateAcquisition({
      ...acquisition,
      [field]: value
    });
  };
  
  // Update holding costs
  const updateHoldingCostField = (field: string, value: boolean) => {
    const updatedHoldingCosts = {
      ...holdingCosts,
      [field]: value
    };
    
    setHoldingCosts(updatedHoldingCosts);
    
    updateAcquisition({
      ...acquisition,
      includeHoldingCosts: updatedHoldingCosts
    });
  };
  
  // Calculate estimated monthly holding costs based on operation expenses
  const estimateMonthlyHoldingCost = () => {
    if (acquisition.useCustomHoldingCost && acquisition.customMonthlyHoldingCost) {
      return acquisition.customMonthlyHoldingCost;
    }
    
    // For non-custom holding costs, use a simplified calculation based on the operation expenses
    let totalMonthly = 0;
    
    // This estimates actual holding costs based on which boxes are checked
    if (holdingCosts.mortgage && acquisition.purchaseLoanAmount && acquisition.purchaseLoanRate && acquisition.purchaseLoanTermYears) {
      // Estimate monthly mortgage payment
      const rate = acquisition.purchaseLoanRate / 12; // monthly rate
      const payments = acquisition.purchaseLoanTermYears * 12; // total number of payments
      const mortgagePayment = acquisition.purchaseLoanAmount * 
        (rate * Math.pow(1 + rate, payments)) / 
        (Math.pow(1 + rate, payments) - 1);
      totalMonthly += mortgagePayment;
    }
    
    if (holdingCosts.taxes) {
      // Assume typical property taxes are 1-2% of property value annually
      const monthlyTaxes = (acquisition.purchasePrice * 0.015) / 12;
      totalMonthly += monthlyTaxes;
    }
    
    if (holdingCosts.insurance) {
      // Assume insurance is about 0.5% of property value annually
      const monthlyInsurance = (acquisition.purchasePrice * 0.005) / 12;
      totalMonthly += monthlyInsurance;
    }
    
    if (holdingCosts.utilities) {
      // Estimate basic utilities (electricity, water, etc.)
      totalMonthly += 200; // Placeholder amount
    }
    
    if (holdingCosts.maintenance) {
      // Basic maintenance during rehab
      totalMonthly += 100; // Placeholder amount
    }
    
    if (holdingCosts.propertyManagement) {
      // If using property management during rehab (unusual)
      totalMonthly += 100; // Placeholder amount
    }
    
    if (holdingCosts.other) {
      // Other miscellaneous expenses
      totalMonthly += 100; // Placeholder amount
    }
    
    return totalMonthly;
  };
  
  const monthlyHoldingCost = estimateMonthlyHoldingCost();
  const totalHoldingCost = monthlyHoldingCost * acquisition.rehabDurationMonths;


  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Rehab Details</h3>
      
      {/* Rehab Budget and Timeline */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Rehab Budget and Timeline</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Rehab Budget
            </label>
            <CurrencyInput
              value={acquisition.rehabCosts}
              onChange={(value) => updateField('rehabCosts', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Rehab Duration (months)
            </label>
            <NumberInput
              min={0}
              max={24}
              value={acquisition.rehabDurationMonths}
              onChange={(value) => updateField('rehabDurationMonths', value)}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            During the rehab period, the property will not generate rental income,
            but you&apos;ll still have expenses such as property taxes, insurance, and possibly loan payments.
            Configure these holding costs in the section below.
          </p>
        </div>
      </div>
      
      {/* Holding Costs During Rehab */}
      <div className="bg-amber-50 p-6 rounded-lg shadow-sm border border-amber-100 space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-medium text-amber-900 mb-1">Configure Holding Costs During Rehab</h4>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id="use-custom-holding-cost"
                checked={acquisition.useCustomHoldingCost || false}
                onChange={(e) => {
                  updateAcquisition({
                    ...acquisition,
                    useCustomHoldingCost: e.target.checked
                  });
                }}
                className="w-4 h-4 text-navy focus:ring-navy"
              />
              <label htmlFor="use-custom-holding-cost" className="text-sm font-medium text-amber-900">
                Use Custom Monthly Amount
              </label>
            </div>
            
            <button
              type="button"
              onClick={() => {
                const allSelected = Object.values(holdingCosts).every(value => value === true);
                const newValue = !allSelected;
                const updatedHoldingCosts = {
                  mortgage: acquisition.purchaseLoanAmount ? newValue : false,
                  taxes: newValue,
                  insurance: newValue,
                  maintenance: newValue,
                  propertyManagement: newValue,
                  utilities: newValue,
                  other: newValue
                };
                
                setHoldingCosts(updatedHoldingCosts);
                updateAcquisition({
                  ...acquisition,
                  includeHoldingCosts: updatedHoldingCosts,
                  useCustomHoldingCost: false
                });
              }}
              className="text-sm bg-amber-700 hover:bg-amber-800 text-white py-1 px-3 rounded-md transition-colors"
              disabled={acquisition.useCustomHoldingCost || false}
            >
              {Object.values(holdingCosts).every(value => value === true) ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
        
        {acquisition.useCustomHoldingCost ? (
          <div className="mt-4">
            <label htmlFor="custom-holding-cost" className="block text-sm font-medium text-amber-900 mb-1">
              Monthly Holding Cost
            </label>
            <div className="flex items-center">
              <CurrencyInput
                value={acquisition.customMonthlyHoldingCost || 0}
                onChange={(value) => updateField('customMonthlyHoldingCost', value)}
                placeholder="500"
              />
              <p className="ml-2 text-sm text-amber-800">per month during rehab</p>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              This is the total monthly holding cost that will be applied for each month of rehab.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-amber-800 mb-3">
              Select which expenses you&apos;ll have while the property is under rehab:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="holding-mortgage"
                  checked={holdingCosts.mortgage}
                  onChange={(e) => updateHoldingCostField('mortgage', e.target.checked)}
                  className="w-4 h-4 text-navy focus:ring-navy"
                  disabled={!acquisition.purchaseLoanAmount}
                />
                <label htmlFor="holding-mortgage" className="text-gray-900">
                  Mortgage Payments
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="holding-taxes"
                  checked={holdingCosts.taxes}
                  onChange={(e) => updateHoldingCostField('taxes', e.target.checked)}
                  className="w-4 h-4 text-navy focus:ring-navy"
                />
                <label htmlFor="holding-taxes" className="text-gray-900">
                  Property Taxes
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="holding-insurance"
                  checked={holdingCosts.insurance}
                  onChange={(e) => updateHoldingCostField('insurance', e.target.checked)}
                  className="w-4 h-4 text-navy focus:ring-navy"
                />
                <label htmlFor="holding-insurance" className="text-gray-900">
                  Insurance
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="holding-maintenance"
                  checked={holdingCosts.maintenance}
                  onChange={(e) => updateHoldingCostField('maintenance', e.target.checked)}
                  className="w-4 h-4 text-navy focus:ring-navy"
                />
                <label htmlFor="holding-maintenance" className="text-gray-900">
                  Maintenance
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="holding-propertyManagement"
                  checked={holdingCosts.propertyManagement}
                  onChange={(e) => updateHoldingCostField('propertyManagement', e.target.checked)}
                  className="w-4 h-4 text-navy focus:ring-navy"
                />
                <label htmlFor="holding-propertyManagement" className="text-gray-900">
                  Property Management
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="holding-utilities"
                  checked={holdingCosts.utilities}
                  onChange={(e) => updateHoldingCostField('utilities', e.target.checked)}
                  className="w-4 h-4 text-navy focus:ring-navy"
                />
                <label htmlFor="holding-utilities" className="text-gray-900">
                  Utilities
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="holding-other"
                  checked={holdingCosts.other}
                  onChange={(e) => updateHoldingCostField('other', e.target.checked)}
                  className="w-4 h-4 text-navy focus:ring-navy"
                />
                <label htmlFor="holding-other" className="text-gray-900">
                  Other Expenses
                </label>
              </div>
            </div>
          </>
        )}
        
        <div className="mt-2 p-3 bg-amber-100 rounded-md text-amber-800 text-sm">
          <div className="flex justify-between mb-2">
            <p className="font-medium">Estimated Monthly Holding Cost:</p>
            <p className="font-bold">${Math.round(monthlyHoldingCost).toLocaleString()}/month</p>
          </div>
          <div className="flex justify-between mb-2">
            <p className="font-medium">Total Holding Cost for {acquisition.rehabDurationMonths} months:</p>
            <p className="font-bold">${Math.round(totalHoldingCost).toLocaleString()}</p>
          </div>
          <p className="mt-1"><span className="font-medium">Note:</span> These holding costs significantly impact your returns. Vacancy costs are not included here since the property is already vacant during rehab.</p>
        </div>
      </div>
      
      
      
      {/* Rehab Cost Summary */}
      <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100 mt-6">
        <h4 className="text-lg font-medium text-green-900 mb-4">Rehab Cash Requirements</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-green-800">Rehab Budget</p>
            <p className="text-xl font-bold text-green-900">
              ${acquisition.rehabCosts.toLocaleString()}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-green-800">Estimated Holding Costs</p>
            <p className="text-xl font-bold text-green-900">
              ${Math.round(totalHoldingCost).toLocaleString()}
            </p>
            <p className="text-xs text-green-800 mt-1">
              ${Math.round(monthlyHoldingCost).toLocaleString()}/month for {acquisition.rehabDurationMonths} months
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-green-800">Total Rehab Phase Cash Needed</p>
            <p className="text-xl font-bold text-green-900">
              ${(acquisition.rehabCosts + Math.round(totalHoldingCost)).toLocaleString()}
            </p>
            <p className="text-xs text-green-800 mt-1">
              Rehab budget + estimated holding costs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
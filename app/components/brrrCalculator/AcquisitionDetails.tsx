'use client';

import React, { useState } from 'react';
import { PropertyAcquisition } from '../../utils/brrrCalculator/projectionEngine';
import CurrencyInput from './ui/CurrencyInput';
import PercentageInput from './ui/PercentageInput';

interface AcquisitionDetailsProps {
  acquisition: PropertyAcquisition;
  updateAcquisition: (acquisition: PropertyAcquisition) => void;
}

export default function AcquisitionDetails({ 
  acquisition, 
  updateAcquisition 
}: AcquisitionDetailsProps) {
  const [rehabDurationFocused, setRehabDurationFocused] = useState(false);
  const [downPaymentPercent, setDownPaymentPercent] = useState(
    acquisition.purchaseLoanAmount 
      ? (1 - acquisition.purchaseLoanAmount / acquisition.purchasePrice) * 100
      : 20
  );
  

  // Helper to update a specific field
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: keyof PropertyAcquisition, value: any) => {
    updateAcquisition({
      ...acquisition,
      [field]: value
    });
  };

  // Calculate down payment amount
  const downPaymentAmount = acquisition.purchasePrice * (downPaymentPercent / 100);
  
  // Update loan amount when down payment changes
  const updateDownPayment = (percent: number) => {
    setDownPaymentPercent(percent);
    const loanAmount = Math.round(acquisition.purchasePrice * (1 - percent / 100));
    
    updateAcquisition({
      ...acquisition,
      purchaseLoanAmount: loanAmount
    });
  };

  // Calculate total acquisition costs
  const totalAcquisitionCost = 
    acquisition.purchasePrice + 
    acquisition.closingCosts + 
    acquisition.rehabCosts + 
    (acquisition.otherInitialCosts || 0);

  // Calculate total cash needed
  const totalCashNeeded = downPaymentAmount + 
    acquisition.closingCosts + 
    acquisition.rehabCosts + 
    (acquisition.otherInitialCosts || 0);
    

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Acquisition Details</h3>
      
      {/* Purchase Information */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">
        <h4 className="brrrr-section-heading text-lg">Purchase Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="brrrr-label">
              Purchase Price
            </label>
            <CurrencyInput
              value={acquisition.purchasePrice}
              onChange={(value) => {
                // Update purchase price and recalculate loan amount
                updateField('purchasePrice', value);
                if (acquisition.purchaseLoanAmount) {
                  const newLoanAmount = Math.round(value * (1 - downPaymentPercent / 100));
                  updateField('purchaseLoanAmount', newLoanAmount);
                }
              }}
              placeholder="100000"
            />
          </div>
          
          <div>
            <label className="brrrr-label">
              Closing Costs
            </label>
            <CurrencyInput
              value={acquisition.closingCosts}
              onChange={(value) => updateField('closingCosts', value)}
              placeholder="3000"
            />
          </div>
          
          <div>
            <label className="brrrr-label">
              Rehab Budget
            </label>
            <CurrencyInput
              value={acquisition.rehabCosts}
              onChange={(value) => updateField('rehabCosts', value)}
              placeholder="25000"
            />
          </div>
          
          <div>
            <label className="brrrr-label">
              Rehab Duration (months)
            </label>
            <input
              type="number"
              min="0"
              max="24"
              value={acquisition.rehabDurationMonths}
              onChange={(e) => updateField('rehabDurationMonths', parseInt(e.target.value) || 0)}
              onFocus={() => setRehabDurationFocused(true)}
              onBlur={() => setRehabDurationFocused(false)}
              placeholder={rehabDurationFocused ? "" : "2"}
              className="brrrr-input"
            />
            <p className="text-xs text-gray-600 mt-1">Holding costs during rehab can be configured on the Rehab Details screen</p>
          </div>
          
          <div>
            <label className="brrrr-label">
              Other Initial Costs
            </label>
            <CurrencyInput
              value={acquisition.otherInitialCosts || 0}
              onChange={(value) => updateField('otherInitialCosts', value)}
              placeholder="2000"
            />
            <p className="text-xs text-gray-900 mt-1">Furniture, appliances, etc.</p>
          </div>
        </div>
      </div>
      
      {/* Financing Information */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="brrrr-section-heading text-lg">Financing Information</h4>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="using-financing"
              checked={!!acquisition.purchaseLoanAmount}
              onChange={(e) => {
                if (!e.target.checked) {
                  // Clear loan details if not using financing
                  updateAcquisition({
                    ...acquisition,
                    purchaseLoanAmount: undefined,
                    purchaseLoanRate: undefined,
                    purchaseLoanTermYears: undefined
                  });
                  setDownPaymentPercent(100);
                } else {
                  // Set default down payment to 20% of purchase price
                  setDownPaymentPercent(20);
                  updateAcquisition({
                    ...acquisition,
                    purchaseLoanAmount: Math.round(acquisition.purchasePrice * 0.8),
                    purchaseLoanRate: 0.06,
                    purchaseLoanTermYears: 30
                  });
                }
              }}
              className="w-5 h-5 text-navy focus:ring-navy mr-2"
            />
            <label htmlFor="using-financing" className="text-sm font-medium text-gray-900">
              Using Financing
            </label>
          </div>
        </div>
        
        {acquisition.purchaseLoanAmount !== undefined && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="brrrr-label">
                Down Payment (%)
              </label>
              <PercentageInput
                value={downPaymentPercent / 100}
                onChange={(value) => updateDownPayment(value * 100)}
                placeholder="20.0"
              />
            </div>
            
            <div>
              <label className="brrrr-label">
                Down Payment Amount
              </label>
              <div className="p-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-medium">
                ${downPaymentAmount.toLocaleString()}
              </div>
            </div>
            
            <div>
              <label className="brrrr-label">
                Interest Rate
              </label>
              <PercentageInput
                value={acquisition.purchaseLoanRate || 0}
                onChange={(value) => updateField('purchaseLoanRate', value)}
                placeholder="6.0"
              />
            </div>
            
            <div>
              <label className="brrrr-label">
                Loan Term (years)
              </label>
              <select
                value={acquisition.purchaseLoanTermYears || 30}
                onChange={(e) => updateField('purchaseLoanTermYears', parseInt(e.target.value))}
                className="brrrr-input"
              >
                <option value={15}>15 years</option>
                <option value={20}>20 years</option>
                <option value={30}>30 years</option>
              </select>
            </div>
            
            <div>
              <label className="brrrr-label">
                Loan Amount
              </label>
              <div className="p-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-medium">
                ${acquisition.purchaseLoanAmount.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
      
      
      {/* Summary */}
      <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100">
        <h4 className="text-lg font-medium text-green-900 mb-4">Acquisition Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-green-800">Total Acquisition Cost</p>
            <p className="text-xl font-bold text-green-900">
              ${totalAcquisitionCost.toLocaleString()}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-green-800">Total Cash Needed at Closing</p>
            <p className="text-xl font-bold text-green-900">
              ${totalCashNeeded.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
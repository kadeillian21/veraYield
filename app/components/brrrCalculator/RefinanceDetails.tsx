'use client';

import React, { useState, useEffect } from 'react';
import { 
  PropertyAcquisition,
  RefinanceEvent 
} from '../../utils/brrrCalculator/projectionEngine';
import { calculateMinimumARV } from '../../utils/brrrCalculator/refinanceCalculator';
import CurrencyInput from './ui/CurrencyInput';
import PercentageInput from './ui/PercentageInput';
import NumberInput from './ui/NumberInput';

interface RefinanceDetailsProps {
  refinanceEvents: RefinanceEvent[];
  updateRefinanceEvents: (events: RefinanceEvent[]) => void;
  acquisition: PropertyAcquisition;
}

export default function RefinanceDetails({
  refinanceEvents,
  updateRefinanceEvents,
  acquisition
}: RefinanceDetailsProps) {
  // Calculate total investment so far
  const totalInvestment = 
    acquisition.purchasePrice + 
    acquisition.closingCosts + 
    acquisition.rehabCosts + 
    (acquisition.otherInitialCosts || 0);
  
  // Initialize refinance data from existing event or defaults
  const currentRefinance = refinanceEvents.length > 0 ? refinanceEvents[0] : {
    month: acquisition.rehabDurationMonths + 1,
    afterRepairValue: 0,
    refinanceLTV: 0.70,
    refinanceRate: 0.07,
    refinanceTermYears: 30,
    refinanceClosingCosts: 0
  };

  // State for refinance event (single event only)
  const [refinanceData, setRefinanceData] = useState<RefinanceEvent>(currentRefinance);
  
  // Update local state when props change
  useEffect(() => {
    if (refinanceEvents.length > 0) {
      setRefinanceData(refinanceEvents[0]);
    }
  }, [refinanceEvents]);

  // Save refinance data immediately when changed
  const updateRefinanceData = (updates: Partial<RefinanceEvent>) => {
    const updatedData = { ...refinanceData, ...updates };
    setRefinanceData(updatedData);
    
    // Always update with a single event
    if (updatedData.afterRepairValue > 0) {
      updateRefinanceEvents([updatedData]);
    } else {
      updateRefinanceEvents([]);
    }
  };

  // Calculate minimum ARV needed for a successful BRRRR (getting all money back out)
  const minARV = calculateMinimumARV(
    totalInvestment,
    refinanceData.refinanceLTV,
    refinanceData.refinanceClosingCosts
  );

  // Calculate loan amount from current ARV
  const potentialLoanAmount = Math.floor(refinanceData.afterRepairValue * refinanceData.refinanceLTV);
  
  // Calculate cash recouped
  const cashRecouped = potentialLoanAmount - refinanceData.refinanceClosingCosts;
  
  // Calculate remaining investment
  const remainingInvestment = Math.max(0, totalInvestment - cashRecouped);
  
  // Whether this refinance would be a successful BRRRR
  const isSuccessfulBRRRR = remainingInvestment === 0;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Refinance Details</h3>
      
      {/* ARV and Refinance Timing */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-800">After Repair Value & Timing</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Refinance Month
            </label>
            <NumberInput
              min={acquisition.rehabDurationMonths + 1}
              value={refinanceData.month}
              onChange={(value) => updateRefinanceData({
                month: value
              })}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be after rehab completion (month {acquisition.rehabDurationMonths + 1})
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              After Repair Value (ARV)
            </label>
            <CurrencyInput
              value={refinanceData.afterRepairValue}
              onChange={(value) => updateRefinanceData({
                afterRepairValue: value
              })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Estimated market value after renovations
            </p>
          </div>
        </div>
      </div>
      
      {/* Refinance Loan Details */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Refinance Loan Details</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan-to-Value (LTV)
            </label>
            <PercentageInput
              value={refinanceData.refinanceLTV}
              onChange={(value) => updateRefinanceData({
                refinanceLTV: value
              })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Typically 70-80% for investment properties
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate
            </label>
            <PercentageInput
              value={refinanceData.refinanceRate}
              onChange={(value) => updateRefinanceData({
                refinanceRate: value
              })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan Term (years)
            </label>
            <NumberInput
              min={1}
              max={40}
              value={refinanceData.refinanceTermYears}
              onChange={(value) => updateRefinanceData({
                refinanceTermYears: value
              })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Closing Costs
            </label>
            <CurrencyInput
              value={refinanceData.refinanceClosingCosts}
              onChange={(value) => updateRefinanceData({
                refinanceClosingCosts: value
              })}
            />
          </div>
        </div>
      </div>
      
      {/* Refinance Analysis */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-blue-800 mb-4">Refinance Analysis</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-blue-800">Current Settings</h5>
            <div className="mt-2 space-y-2">
              <div>
                <p className="text-sm text-blue-700">Total Investment</p>
                <p className="text-lg font-semibold text-blue-900">
                  ${totalInvestment.toLocaleString()}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-blue-700">New Loan Amount</p>
                <p className="text-lg font-semibold text-blue-900">
                  ${potentialLoanAmount.toLocaleString()}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-blue-700">Cash Recouped</p>
                <p className="text-lg font-semibold text-blue-900">
                  ${cashRecouped.toLocaleString()}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-blue-700">Remaining Investment</p>
                <p className={`text-lg font-semibold ${isSuccessfulBRRRR ? 'text-green-600' : 'text-blue-900'}`}>
                  ${remainingInvestment.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-blue-800">BRRRR Success Targets</h5>
            <div className="mt-2 space-y-2">
              <div>
                <p className="text-sm text-blue-700">Minimum ARV Needed</p>
                <p className="text-lg font-semibold text-blue-900">
                  ${minARV.toLocaleString()}
                </p>
                <p className="text-xs text-blue-700">
                  To recover 100% of your investment
                </p>
              </div>
              
              <div>
                <p className="text-sm text-blue-700">ARV to Investment Ratio</p>
                <p className="text-lg font-semibold text-blue-900">
                  {(refinanceData.afterRepairValue / totalInvestment).toFixed(2)}x
                </p>
                <p className="text-xs text-blue-700">
                  Target: 1.4x or higher for successful BRRRR
                </p>
              </div>
              
              <div>
                <p className="text-sm text-blue-700">BRRRR Status</p>
                <p className={`text-lg font-semibold ${isSuccessfulBRRRR ? 'text-green-600' : 'text-red-600'}`}>
                  {isSuccessfulBRRRR ? 'Successful' : 'Partial'}
                </p>
                <p className="text-xs text-blue-700">
                  {isSuccessfulBRRRR 
                    ? "You'll recoup all of your initial investment!" 
                    : `You'll still have $${remainingInvestment.toLocaleString()} invested`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* BRRRR Strategy Tips */}
      <div className="bg-amber-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-amber-800 mb-2">BRRRR Refinance Tips</h4>
        
        <ul className="list-disc list-inside text-amber-700 space-y-1">
          <li>Consider waiting 6-12 months after purchase to refinance (seasoning)</li>
          <li>Aim for an ARV that&apos;s at least 1.4x your total investment</li>
          <li>Compare different refinancing timelines to optimize your returns</li>
          <li>A successful BRRRR lets you recycle your capital into the next deal</li>
          <li>Even a partial BRRRR can be successful if your cash-on-cash return is strong</li>
        </ul>
      </div>
    </div>
  );
}
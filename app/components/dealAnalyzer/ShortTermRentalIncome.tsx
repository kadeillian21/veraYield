'use client';

import React from 'react';
import CurrencyInput from '../brrrCalculator/ui/CurrencyInput';
import PercentageInput from '../brrrCalculator/ui/PercentageInput';
// NumberInput is imported but not used
// import NumberInput from '../brrrCalculator/ui/NumberInput';

// Define interface for new STR Income structure
export interface STRIncome {
  peakSeasonDaily: number;
  peakSeasonOccupancy: number;
  peakSeasonMonths: number[];
  midSeasonDaily: number;
  midSeasonOccupancy: number;
  midSeasonMonths: number[];
  lowSeasonDaily: number;
  lowSeasonOccupancy: number;
  lowSeasonMonths: number[];
  cleaningFee: number;
  otherFees: number;
  platformFee: number; // as a percentage
}

interface ShortTermRentalIncomeProps {
  strIncome: STRIncome;
  updateSTRIncome: (strIncome: STRIncome) => void;
}

export default function ShortTermRentalIncome({ 
  strIncome, 
  updateSTRIncome 
}: ShortTermRentalIncomeProps) {
  // Helper function to update a specific field
  const updateField = <K extends keyof STRIncome>(field: K, value: STRIncome[K]) => {
    updateSTRIncome({
      ...strIncome,
      [field]: value
    });
  };

  // Toggle month selection in a season
  const toggleMonth = (month: number, season: 'peak' | 'mid' | 'low') => {
    const peakMonths = [...strIncome.peakSeasonMonths];
    const midMonths = [...strIncome.midSeasonMonths];
    const lowMonths = [...strIncome.lowSeasonMonths];
    
    // First remove the month from all seasons
    const filteredPeak = peakMonths.filter(m => m !== month);
    const filteredMid = midMonths.filter(m => m !== month);
    const filteredLow = lowMonths.filter(m => m !== month);
    
    // Then add it to the selected season
    if (season === 'peak') {
      filteredPeak.push(month);
      filteredPeak.sort((a, b) => a - b);
    } else if (season === 'mid') {
      filteredMid.push(month);
      filteredMid.sort((a, b) => a - b);
    } else {
      filteredLow.push(month);
      filteredLow.sort((a, b) => a - b);
    }
    
    // Update all three arrays
    updateSTRIncome({
      ...strIncome,
      peakSeasonMonths: filteredPeak,
      midSeasonMonths: filteredMid,
      lowSeasonMonths: filteredLow
    });
  };

  // Calculate estimated annual revenue
  const calculateAnnualRevenue = () => {
    // Calculate revenue for each season
    const peakRevenue = strIncome.peakSeasonMonths.length * 30 * 
                        strIncome.peakSeasonDaily * (strIncome.peakSeasonOccupancy / 100);
    
    const midRevenue = strIncome.midSeasonMonths.length * 30 * 
                       strIncome.midSeasonDaily * (strIncome.midSeasonOccupancy / 100);
    
    const lowRevenue = strIncome.lowSeasonMonths.length * 30 * 
                       strIncome.lowSeasonDaily * (strIncome.lowSeasonOccupancy / 100);
    
    // Calculate total nights booked
    const peakNights = strIncome.peakSeasonMonths.length * 30 * (strIncome.peakSeasonOccupancy / 100);
    const midNights = strIncome.midSeasonMonths.length * 30 * (strIncome.midSeasonOccupancy / 100);
    const lowNights = strIncome.lowSeasonMonths.length * 30 * (strIncome.lowSeasonOccupancy / 100);
    const totalNights = peakNights + midNights + lowNights;
    
    // Calculate cleaning and other fees
    const cleaningFeeRevenue = totalNights * strIncome.cleaningFee;
    const otherFeesRevenue = totalNights * strIncome.otherFees;
    
    // Calculate total before platform fee
    const totalBeforeFee = peakRevenue + midRevenue + lowRevenue + cleaningFeeRevenue + otherFeesRevenue;
    
    // Subtract platform fee
    const platformFeeAmount = totalBeforeFee * (strIncome.platformFee / 100);
    
    // Calculate total annual revenue
    const totalAnnualRevenue = totalBeforeFee - platformFeeAmount;
    
    return {
      peakRevenue,
      midRevenue,
      lowRevenue,
      cleaningFeeRevenue,
      otherFeesRevenue,
      platformFeeAmount,
      totalAnnualRevenue,
      averageMonthly: totalAnnualRevenue / 12,
      totalNights
    };
  };

  // Seasonal names for display
  const seasonNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Calculate revenue summary
  const revenueSummary = calculateAnnualRevenue();

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Short-Term Rental Income</h3>
      
      {/* Seasonal Rate Configuration */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-6">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Seasonal Rate Configuration</h4>
        
        {/* Peak Season */}
        <div className="border-l-4 border-red-500 pl-4 py-2 bg-white rounded shadow-sm">
          <h5 className="font-medium text-red-700">Peak Season</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Nightly Rate
              </label>
              <CurrencyInput
                value={strIncome.peakSeasonDaily}
                onChange={(value) => updateField('peakSeasonDaily', value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occupancy Rate
              </label>
              <PercentageInput
                value={strIncome.peakSeasonOccupancy / 100}
                onChange={(value) => updateField('peakSeasonOccupancy', value * 100)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Revenue (est.)
              </label>
              <div className="py-2 px-3 bg-red-50 border border-red-100 rounded-md text-red-800 font-medium">
                ${Math.round(strIncome.peakSeasonDaily * 30 * (strIncome.peakSeasonOccupancy / 100)).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mid Season */}
        <div className="border-l-4 border-yellow-500 pl-4 py-2 bg-white rounded shadow-sm">
          <h5 className="font-medium text-yellow-700">Mid Season</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Nightly Rate
              </label>
              <CurrencyInput
                value={strIncome.midSeasonDaily}
                onChange={(value) => updateField('midSeasonDaily', value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occupancy Rate
              </label>
              <PercentageInput
                value={strIncome.midSeasonOccupancy / 100}
                onChange={(value) => updateField('midSeasonOccupancy', value * 100)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Revenue (est.)
              </label>
              <div className="py-2 px-3 bg-yellow-50 border border-yellow-100 rounded-md text-yellow-800 font-medium">
                ${Math.round(strIncome.midSeasonDaily * 30 * (strIncome.midSeasonOccupancy / 100)).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        
        {/* Low Season */}
        <div className="border-l-4 border-blue-500 pl-4 py-2 bg-white rounded shadow-sm">
          <h5 className="font-medium text-blue-700">Low Season</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Nightly Rate
              </label>
              <CurrencyInput
                value={strIncome.lowSeasonDaily}
                onChange={(value) => updateField('lowSeasonDaily', value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occupancy Rate
              </label>
              <PercentageInput
                value={strIncome.lowSeasonOccupancy / 100}
                onChange={(value) => updateField('lowSeasonOccupancy', value * 100)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Revenue (est.)
              </label>
              <div className="py-2 px-3 bg-blue-50 border border-blue-100 rounded-md text-blue-800 font-medium">
                ${Math.round(strIncome.lowSeasonDaily * 30 * (strIncome.lowSeasonOccupancy / 100)).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Season Calendar */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Season Calendar</h4>
        <p className="text-sm text-gray-600 mb-4">
          Assign each month to a season to calculate your annual revenue.
        </p>
        
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {seasonNames.map((name, index) => {
            // Determine which season this month belongs to
            const isPeak = strIncome.peakSeasonMonths.includes(index + 1);
            const isMid = strIncome.midSeasonMonths.includes(index + 1);
            const isLow = strIncome.lowSeasonMonths.includes(index + 1);
            
            let bgColor = 'bg-gray-200';
            let textColor = 'text-gray-700';
            // Variable declared but not used
            // let season: 'peak' | 'mid' | 'low' = 'low';
            
            if (isPeak) {
              bgColor = 'bg-red-100';
              textColor = 'text-red-800';
              // season variable is not used
              // season = 'peak';
            } else if (isMid) {
              bgColor = 'bg-yellow-100';
              textColor = 'text-yellow-800';
              // season variable is not used
              // season = 'mid';
            } else if (isLow) {
              bgColor = 'bg-blue-100';
              textColor = 'text-blue-800';
              // season variable is not used
              // season = 'low';
            }
            
            return (
              <div key={index} className="relative">
                <div className={`p-3 rounded-md ${bgColor} ${textColor} text-center`}>
                  <span className="font-medium">{name}</span>
                </div>
                
                <div className="absolute top-full left-0 right-0 mt-1 flex space-x-1 justify-center">
                  <button
                    type="button"
                    onClick={() => toggleMonth(index + 1, 'peak')}
                    className={`w-2 h-2 rounded-full ${isPeak ? 'bg-red-500' : 'bg-gray-300'}`}
                    title="Peak Season"
                  />
                  <button
                    type="button"
                    onClick={() => toggleMonth(index + 1, 'mid')}
                    className={`w-2 h-2 rounded-full ${isMid ? 'bg-yellow-500' : 'bg-gray-300'}`}
                    title="Mid Season"
                  />
                  <button
                    type="button"
                    onClick={() => toggleMonth(index + 1, 'low')}
                    className={`w-2 h-2 rounded-full ${isLow ? 'bg-blue-500' : 'bg-gray-300'}`}
                    title="Low Season"
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 flex justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-700">Peak Season</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-sm text-gray-700">Mid Season</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm text-gray-700">Low Season</span>
          </div>
        </div>
      </div>
      
      {/* Additional Fees */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Additional Fees & Charges</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cleaning Fee (per stay)
            </label>
            <CurrencyInput
              value={strIncome.cleaningFee}
              onChange={(value) => updateField('cleaningFee', value)}
            />
            <p className="text-xs text-gray-500 mt-1">Charged to guests for each stay</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Fees (per stay)
            </label>
            <CurrencyInput
              value={strIncome.otherFees}
              onChange={(value) => updateField('otherFees', value)}
            />
            <p className="text-xs text-gray-500 mt-1">Pet fees, resort fees, etc.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform Fee (%)
            </label>
            <PercentageInput
              value={strIncome.platformFee / 100}
              onChange={(value) => updateField('platformFee', value * 100)}
            />
            <p className="text-xs text-gray-500 mt-1">Airbnb, VRBO, etc. commission</p>
          </div>
        </div>
      </div>
      
      {/* Revenue Summary */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-100">
        <h4 className="text-lg font-medium text-green-800 mb-4">Revenue Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-green-700">Peak Season Revenue:</span>
              <span className="font-medium text-green-800">${Math.round(revenueSummary.peakRevenue).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Mid Season Revenue:</span>
              <span className="font-medium text-green-800">${Math.round(revenueSummary.midRevenue).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Low Season Revenue:</span>
              <span className="font-medium text-green-800">${Math.round(revenueSummary.lowRevenue).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Cleaning Fee Revenue:</span>
              <span className="font-medium text-green-800">${Math.round(revenueSummary.cleaningFeeRevenue).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Other Fees Revenue:</span>
              <span className="font-medium text-green-800">${Math.round(revenueSummary.otherFeesRevenue).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-red-700">
              <span>Platform Fees:</span>
              <span className="font-medium">-${Math.round(revenueSummary.platformFeeAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-green-200">
              <span className="text-lg font-semibold text-green-800">Total Annual Revenue:</span>
              <span className="text-lg font-bold text-green-800">${Math.round(revenueSummary.totalAnnualRevenue).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-3 border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-green-800">Monthly Average:</span>
              <span className="text-2xl font-bold text-green-800">${Math.round(revenueSummary.averageMonthly).toLocaleString()}</span>
            </div>
            
            <div className="bg-green-100 p-3 rounded-md">
              <h5 className="font-medium text-green-800 mb-2">Occupancy Statistics</h5>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-sm text-green-700">Estimated Bookings:</span>
                  <p className="font-semibold text-green-800">{Math.round(revenueSummary.totalNights)} nights per year</p>
                </div>
                <div>
                  <span className="text-sm text-green-700">Average Occupancy:</span>
                  <p className="font-semibold text-green-800">
                    {Math.round(revenueSummary.totalNights / 365 * 100)}% yearly
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Your STR income calculation is based on:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>{strIncome.peakSeasonMonths.length} peak season months</li>
                <li>{strIncome.midSeasonMonths.length} mid season months</li>
                <li>{strIncome.lowSeasonMonths.length} low season months</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* STR Tips */}
      <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
        <h4 className="text-lg font-medium text-amber-800 mb-2">Short-Term Rental Tips</h4>
        
        <ul className="list-disc list-inside text-amber-700 space-y-1">
          <li>Short-term rentals usually have 3-5x the operating expenses of long-term rentals</li>
          <li>Factor in higher vacancy periods, especially during low seasons</li>
          <li>Consider the impact of seasonal fluctuations on your cash flow</li>
          <li>Budget 10-15% of revenue for furnishings and replacement costs</li>
          <li>Check local regulations before purchasing - many areas have STR restrictions</li>
        </ul>
      </div>
    </div>
  );
}
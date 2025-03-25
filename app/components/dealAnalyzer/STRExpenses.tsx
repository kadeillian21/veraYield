'use client';

import React from 'react';
import CurrencyInput from '../brrrCalculator/ui/CurrencyInput';
import PercentageInput from '../brrrCalculator/ui/PercentageInput';
import { STRIncome } from './ShortTermRentalIncome';

export interface STRExpenses {
  propertyManagementFee: number; // Percentage of revenue
  cleaningCosts: number; // Cost per clean
  suppliesPerMonth: number;
  utilityExpenses: number; // Monthly
  propertyTaxes: number; // Annual
  insurance: number; // Annual
  furnitureReplacementPercent: number; // Percentage of revenue
  maintenancePercent: number; // Percentage of revenue
  advertisingPerMonth: number;
  subscriptionServices: number; // Monthly
  otherExpenses: number; // Monthly
}

interface STRExpensesProps {
  strIncome: STRIncome;
  strExpenses: STRExpenses;
  updateSTRExpenses: (expenses: STRExpenses) => void;
}

export default function STRExpenses({ 
  strIncome, 
  strExpenses, 
  updateSTRExpenses 
}: STRExpensesProps) {
  // Helper function to update a specific field
  const updateField = <K extends keyof STRExpenses>(field: K, value: STRExpenses[K]) => {
    updateSTRExpenses({
      ...strExpenses,
      [field]: value
    });
  };

  // Calculate annual revenue from STRIncome
  const calculateAnnualRevenue = (): number => {
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
    
    return totalAnnualRevenue;
  };

  // Calculate total expenses and cash flow
  const calculateExpenses = () => {
    const annualRevenue = calculateAnnualRevenue();
    const monthlyRevenue = annualRevenue / 12;
    
    // Calculate total nights booked to determine cleaning costs
    const peakNights = strIncome.peakSeasonMonths.length * 30 * (strIncome.peakSeasonOccupancy / 100);
    const midNights = strIncome.midSeasonMonths.length * 30 * (strIncome.midSeasonOccupancy / 100);
    const lowNights = strIncome.lowSeasonMonths.length * 30 * (strIncome.lowSeasonOccupancy / 100);
    const totalNights = peakNights + midNights + lowNights;
    
    // Calculate annual turnover (number of bookings, assuming average 3-night stay)
    const averageStayLength = 3; // Typically 2-4 nights for STRs
    const annualTurnover = totalNights / averageStayLength;
    
    // Calculate expenses
    const propertyManagementExpense = annualRevenue * (strExpenses.propertyManagementFee / 100);
    const cleaningExpense = annualTurnover * strExpenses.cleaningCosts;
    const suppliesExpense = strExpenses.suppliesPerMonth * 12;
    const utilitiesExpense = strExpenses.utilityExpenses * 12;
    const propertyTaxExpense = strExpenses.propertyTaxes;
    const insuranceExpense = strExpenses.insurance;
    const furnitureExpense = annualRevenue * (strExpenses.furnitureReplacementPercent / 100);
    const maintenanceExpense = annualRevenue * (strExpenses.maintenancePercent / 100);
    const advertisingExpense = strExpenses.advertisingPerMonth * 12;
    const subscriptionExpense = strExpenses.subscriptionServices * 12;
    const otherExpense = strExpenses.otherExpenses * 12;
    
    // Total annual expenses
    const totalAnnualExpenses = 
      propertyManagementExpense +
      cleaningExpense +
      suppliesExpense +
      utilitiesExpense +
      propertyTaxExpense +
      insuranceExpense +
      furnitureExpense +
      maintenanceExpense +
      advertisingExpense +
      subscriptionExpense +
      otherExpense;
    
    // Monthly expense breakdown
    const monthlyExpenses = totalAnnualExpenses / 12;
    
    // Calculate cash flow
    const monthlyCashFlow = monthlyRevenue - monthlyExpenses;
    
    return {
      propertyManagementExpense,
      cleaningExpense,
      suppliesExpense,
      utilitiesExpense,
      propertyTaxExpense,
      insuranceExpense,
      furnitureExpense,
      maintenanceExpense,
      advertisingExpense,
      subscriptionExpense,
      otherExpense,
      totalAnnualExpenses,
      monthlyExpenses,
      monthlyCashFlow,
      annualTurnover
    };
  };

  const expenseSummary = calculateExpenses();
  const annualRevenue = calculateAnnualRevenue();
  const monthlyRevenue = annualRevenue / 12;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Short-Term Rental Expenses</h3>
      
      {/* Core Operating Expenses */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Core Operating Expenses</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Property Management Fee */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Management Fee
            </label>
            <PercentageInput
              value={strExpenses.propertyManagementFee / 100}
              onChange={(value) => updateField('propertyManagementFee', value * 100)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Typically 15-30% of revenue for full-service STR management
            </p>
            <div className="mt-2 text-gray-600 flex justify-between items-center">
              <span className="text-sm">Annual Cost:</span>
              <span className="font-medium">
                ${Math.round(expenseSummary.propertyManagementExpense).toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* Cleaning Costs */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cleaning Cost (per turnover)
            </label>
            <CurrencyInput
              value={strExpenses.cleaningCosts}
              onChange={(value) => updateField('cleaningCosts', value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Paid to cleaning service for each guest turnover
            </p>
            <div className="mt-2 text-gray-600 flex justify-between items-center">
              <span className="text-sm">Est. Annual Turnovers:</span>
              <span className="font-medium">{Math.round(expenseSummary.annualTurnover)}</span>
            </div>
            <div className="mt-1 text-gray-600 flex justify-between items-center">
              <span className="text-sm">Annual Cost:</span>
              <span className="font-medium">
                ${Math.round(expenseSummary.cleaningExpense).toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* Supplies */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Supplies
            </label>
            <CurrencyInput
              value={strExpenses.suppliesPerMonth}
              onChange={(value) => updateField('suppliesPerMonth', value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Toiletries, coffee, consumables, etc.
            </p>
            <div className="mt-2 text-gray-600 flex justify-between items-center">
              <span className="text-sm">Annual Cost:</span>
              <span className="font-medium">
                ${Math.round(expenseSummary.suppliesExpense).toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* Utilities */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Utilities
            </label>
            <CurrencyInput
              value={strExpenses.utilityExpenses}
              onChange={(value) => updateField('utilityExpenses', value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Water, gas, electric, internet, cable TV
            </p>
            <div className="mt-2 text-gray-600 flex justify-between items-center">
              <span className="text-sm">Annual Cost:</span>
              <span className="font-medium">
                ${Math.round(expenseSummary.utilitiesExpense).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed Expenses */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Fixed Annual Expenses</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Property Taxes */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Property Taxes
            </label>
            <CurrencyInput
              value={strExpenses.propertyTaxes}
              onChange={(value) => updateField('propertyTaxes', value)}
            />
            <div className="mt-2 text-gray-600 flex justify-between items-center">
              <span className="text-sm">Monthly Cost:</span>
              <span className="font-medium">
                ${Math.round(expenseSummary.propertyTaxExpense / 12).toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* Insurance */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Insurance
            </label>
            <CurrencyInput
              value={strExpenses.insurance}
              onChange={(value) => updateField('insurance', value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              STR insurance is typically higher than residential
            </p>
            <div className="mt-2 text-gray-600 flex justify-between items-center">
              <span className="text-sm">Monthly Cost:</span>
              <span className="font-medium">
                ${Math.round(expenseSummary.insuranceExpense / 12).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Variable Expenses */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Variable & Maintenance Expenses</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Furniture Replacement */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Furniture Replacement (% of revenue)
            </label>
            <PercentageInput
              value={strExpenses.furnitureReplacementPercent / 100}
              onChange={(value) => updateField('furnitureReplacementPercent', value * 100)}
            />
            <p className="text-xs text-gray-500 mt-1">
              STRs typically need furniture replacement every 3-5 years
            </p>
            <div className="mt-2 text-gray-600 flex justify-between items-center">
              <span className="text-sm">Annual Reserve:</span>
              <span className="font-medium">
                ${Math.round(expenseSummary.furnitureExpense).toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* Maintenance */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maintenance (% of revenue)
            </label>
            <PercentageInput
              value={strExpenses.maintenancePercent / 100}
              onChange={(value) => updateField('maintenancePercent', value * 100)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Higher turnover = more wear and tear
            </p>
            <div className="mt-2 text-gray-600 flex justify-between items-center">
              <span className="text-sm">Annual Cost:</span>
              <span className="font-medium">
                ${Math.round(expenseSummary.maintenanceExpense).toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* Marketing & Advertising */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Marketing & Advertising
            </label>
            <CurrencyInput
              value={strExpenses.advertisingPerMonth}
              onChange={(value) => updateField('advertisingPerMonth', value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Photography, listing optimization, etc.
            </p>
            <div className="mt-2 text-gray-600 flex justify-between items-center">
              <span className="text-sm">Annual Cost:</span>
              <span className="font-medium">
                ${Math.round(expenseSummary.advertisingExpense).toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* Subscription Services */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Subscription Services
            </label>
            <CurrencyInput
              value={strExpenses.subscriptionServices}
              onChange={(value) => updateField('subscriptionServices', value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Smart locks, noise monitors, channel managers
            </p>
            <div className="mt-2 text-gray-600 flex justify-between items-center">
              <span className="text-sm">Annual Cost:</span>
              <span className="font-medium">
                ${Math.round(expenseSummary.subscriptionExpense).toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* Other Expenses */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Monthly Expenses
            </label>
            <CurrencyInput
              value={strExpenses.otherExpenses}
              onChange={(value) => updateField('otherExpenses', value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Any additional operating costs
            </p>
            <div className="mt-2 text-gray-600 flex justify-between items-center">
              <span className="text-sm">Annual Cost:</span>
              <span className="font-medium">
                ${Math.round(expenseSummary.otherExpense).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Expense Summary */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h4 className="text-lg font-medium text-blue-800 mb-4">Short-Term Rental Cash Flow Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
              <div className="mb-3">
                <div className="flex justify-between items-center border-b border-blue-100 pb-2 mb-2">
                  <span className="text-lg font-medium text-blue-800">Monthly Revenue</span>
                  <span className="text-lg font-bold text-blue-800">
                    ${Math.round(monthlyRevenue).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center border-b border-blue-100 pb-2 mb-2">
                  <span className="text-lg font-medium text-blue-800">Monthly Expenses</span>
                  <span className="text-lg font-bold text-red-600">
                    -${Math.round(expenseSummary.monthlyExpenses).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xl font-semibold text-blue-800">Net Monthly Cash Flow</span>
                  <span className={`text-xl font-bold ${expenseSummary.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.round(expenseSummary.monthlyCashFlow).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border border-blue-200">
              <h5 className="font-medium text-blue-800 mb-2">Expense Ratio</h5>
              <div className="flex items-center">
                <div className="h-4 bg-red-500 rounded-l-full" style={{ width: `${(expenseSummary.totalAnnualExpenses / annualRevenue) * 100}%` }}></div>
                <div className="h-4 bg-green-500 rounded-r-full" style={{ width: `${100 - (expenseSummary.totalAnnualExpenses / annualRevenue) * 100}%` }}></div>
              </div>
              <div className="flex justify-between mt-1 text-sm">
                <span className="text-red-700">Expenses: {Math.round((expenseSummary.totalAnnualExpenses / annualRevenue) * 100)}%</span>
                <span className="text-green-700">Profit: {Math.round(100 - (expenseSummary.totalAnnualExpenses / annualRevenue) * 100)}%</span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
              <h5 className="font-medium text-blue-800 mb-2">Expense Breakdown</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Property Management:</span>
                  <span className="font-medium text-gray-900">
                    ${Math.round(expenseSummary.propertyManagementExpense / 12).toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Cleaning:</span>
                  <span className="font-medium text-gray-900">
                    ${Math.round(expenseSummary.cleaningExpense / 12).toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Supplies:</span>
                  <span className="font-medium text-gray-900">
                    ${Math.round(expenseSummary.suppliesExpense / 12).toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Utilities:</span>
                  <span className="font-medium text-gray-900">
                    ${Math.round(expenseSummary.utilitiesExpense / 12).toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Property Taxes:</span>
                  <span className="font-medium text-gray-900">
                    ${Math.round(expenseSummary.propertyTaxExpense / 12).toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Insurance:</span>
                  <span className="font-medium text-gray-900">
                    ${Math.round(expenseSummary.insuranceExpense / 12).toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Furniture Replacement:</span>
                  <span className="font-medium text-gray-900">
                    ${Math.round(expenseSummary.furnitureExpense / 12).toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Maintenance:</span>
                  <span className="font-medium text-gray-900">
                    ${Math.round(expenseSummary.maintenanceExpense / 12).toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Marketing & Advertising:</span>
                  <span className="font-medium text-gray-900">
                    ${Math.round(expenseSummary.advertisingExpense / 12).toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Subscription Services:</span>
                  <span className="font-medium text-gray-900">
                    ${Math.round(expenseSummary.subscriptionExpense / 12).toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Other Expenses:</span>
                  <span className="font-medium text-gray-900">
                    ${Math.round(expenseSummary.otherExpense / 12).toLocaleString()}/mo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* STR Expense Tips */}
      <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
        <h4 className="text-lg font-medium text-amber-800 mb-2">Short-Term Rental Expense Tips</h4>
        
        <ul className="list-disc list-inside text-amber-700 space-y-1">
          <li>Always budget for higher utility costs than a traditional rental</li>
          <li>Use professional cleaning services to maintain 5-star reviews</li>
          <li>Consider a 10% buffer for unexpected expenses in your first year</li>
          <li>If self-managing, value your time - it takes 10-20 hours per month</li>
          <li>Insurance for STRs can cost 2-3 times more than traditional landlord policies</li>
        </ul>
      </div>
    </div>
  );
}
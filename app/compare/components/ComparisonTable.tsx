'use client';

import React from 'react';
import { DealData } from '../dealAnalyzer/DealAnalyzer';

interface ComparisonTableProps {
  deals: DealData[];
  selectedDeals: string[];
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ deals, selectedDeals }) => {
  // Filter to only selected deals and ensure they exist
  const dealsToCompare = deals.filter(deal => selectedDeals.includes(deal.id));
  
  if (dealsToCompare.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">Select deals to compare them.</p>
      </div>
    );
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatPercent = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const getStrategyDisplayName = (strategy: string): string => {
    const names: Record<string, string> = {
      brrrr: 'BRRRR',
      longTermRental: 'Long-Term Rental',
      shortTermRental: 'Short-Term Rental',
      multifamily: 'Multi-Family',
      houseHack: 'House Hack',
    };
    return names[strategy] || strategy;
  };

  // Calculate metrics for each deal
  const dealMetrics = dealsToCompare.map(deal => {
    const purchasePrice = deal.config.acquisition?.purchasePrice || 0;
    const monthlyRent = deal.config.operation?.monthlyRent || 0;
    const annualRent = monthlyRent * 12;
    const roi = purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0;
    
    // Calculate cash on cash return
    const downPayment = purchasePrice - (deal.config.acquisition?.purchaseLoanAmount || 0);
    const closingCosts = deal.config.acquisition?.closingCosts || 0;
    const rehabCosts = deal.config.acquisition?.rehabCosts || 0;
    const totalInvestment = downPayment + closingCosts + rehabCosts;
    
    const annualMortgage = (deal.config.acquisition?.purchaseLoanAmount || 0) * 
                          (deal.config.acquisition?.purchaseLoanRate || 0.05) * 
                          (1 + (1 / (Math.pow(1 + (deal.config.acquisition?.purchaseLoanRate || 0.05), 
                          (deal.config.acquisition?.purchaseLoanTermYears || 30) * 12) - 1))) * 12;
    
    // Estimated expenses (simplified)
    const expenses = (deal.config.operation?.propertyTaxes || 0) + 
                    (deal.config.operation?.insurance || 0) + 
                    (deal.config.operation?.maintenance || 0) + 
                    (deal.config.operation?.utilities || 0) +
                    ((deal.config.operation?.propertyManagement || 0) / 100 * annualRent);
    
    const annualCashFlow = annualRent - annualMortgage - expenses;
    const cashOnCash = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;
    const monthlyCashFlow = annualCashFlow / 12;
    
    // Calculate cap rate
    const netOperatingIncome = annualRent - expenses; // NOI = annual rent - expenses (excluding mortgage)
    const capRate = purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;
    
    // Calculate debt service coverage ratio
    const debtServiceCoverageRatio = annualMortgage > 0 ? netOperatingIncome / annualMortgage : 0;
    
    // Calculate gross rent multiplier
    const grossRentMultiplier = annualRent > 0 ? purchasePrice / annualRent : 0;
    
    // Calculate 1% rule check
    const onePercentRuleMonthly = purchasePrice > 0 ? (monthlyRent / purchasePrice) * 100 : 0;
    
    return {
      dealId: deal.id,
      dealName: deal.name || deal.address || 'Unnamed Deal',
      strategy: getStrategyDisplayName(deal.strategy),
      address: deal.address,
      purchasePrice,
      totalInvestment,
      monthlyRent,
      annualRent,
      monthlyCashFlow,
      annualCashFlow,
      roi,
      cashOnCash,
      capRate,
      debtServiceCoverageRatio,
      grossRentMultiplier,
      onePercentRuleMonthly,
      mortgage: {
        loanAmount: deal.config.acquisition?.purchaseLoanAmount || 0,
        interestRate: deal.config.acquisition?.purchaseLoanRate || 0,
        termYears: deal.config.acquisition?.purchaseLoanTermYears || 30,
        monthlyPayment: annualMortgage / 12
      },
      expenses: {
        propertyTaxes: deal.config.operation?.propertyTaxes || 0,
        insurance: deal.config.operation?.insurance || 0,
        maintenance: deal.config.operation?.maintenance || 0,
        propertyManagement: deal.config.operation?.propertyManagement || 0,
        utilities: deal.config.operation?.utilities || 0,
        vacancy: deal.config.operation?.vacancyRate || 0,
        other: deal.config.operation?.otherExpenses || 0
      }
    };
  });
  
  // Define metrics to display in the order they should appear
  const metricDefinitions = [
    { key: 'purchasePrice', label: 'Purchase Price', format: formatCurrency },
    { key: 'totalInvestment', label: 'Total Investment', format: formatCurrency },
    { key: 'monthlyRent', label: 'Monthly Rent', format: formatCurrency },
    { key: 'monthlyCashFlow', label: 'Monthly Cash Flow', format: formatCurrency },
    { key: 'roi', label: 'ROI', format: formatPercent },
    { key: 'cashOnCash', label: 'Cash on Cash Return', format: formatPercent },
    { key: 'capRate', label: 'Cap Rate', format: formatPercent },
    { key: 'debtServiceCoverageRatio', label: 'DSCR', format: (value: number) => value.toFixed(2) },
    { key: 'grossRentMultiplier', label: 'GRM', format: (value: number) => value.toFixed(2) },
    { key: 'onePercentRuleMonthly', label: '1% Rule', format: formatPercent },
  ];
  
  // Define expense metrics
  const expenseMetrics = [
    { key: 'propertyTaxes', label: 'Property Taxes (monthly)', format: formatCurrency },
    { key: 'insurance', label: 'Insurance (monthly)', format: formatCurrency },
    { key: 'maintenance', label: 'Maintenance (monthly)', format: formatCurrency },
    { key: 'propertyManagement', label: 'Property Management', format: (value: number) => `${value}%` },
    { key: 'utilities', label: 'Utilities (monthly)', format: formatCurrency },
    { key: 'vacancy', label: 'Vacancy Rate', format: (value: number) => `${value}%` },
    { key: 'other', label: 'Other Expenses (monthly)', format: formatCurrency },
  ];
  
  // Define mortgage metrics
  const mortgageMetrics = [
    { key: 'loanAmount', label: 'Loan Amount', format: formatCurrency },
    { key: 'interestRate', label: 'Interest Rate', format: (value: number) => `${(value * 100).toFixed(2)}%` },
    { key: 'termYears', label: 'Loan Term', format: (value: number) => `${value} years` },
    { key: 'monthlyPayment', label: 'Monthly Payment', format: formatCurrency },
  ];

  // Calculate the best value for highlighting
  const getBestValueIndex = (metric: string, isHigherBetter: boolean = true) => {
    const values = dealMetrics.map(deal => (deal as any)[metric]);
    if (values.length === 0) return -1;
    
    return isHigherBetter
      ? values.indexOf(Math.max(...values))
      : values.indexOf(Math.min(...values));
  };
  
  // Get best expense value (lower is better for expenses)
  const getBestExpenseIndex = (metric: string) => {
    const values = dealMetrics.map(deal => (deal.expenses as any)[metric]);
    if (values.length === 0) return -1;
    
    return values.indexOf(Math.min(...values));
  };
  
  // Property Metrics Sections
  const renderPropertyMetrics = () => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-navy mb-3">Property & Investment Metrics</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metric
              </th>
              {dealMetrics.map((deal) => (
                <th key={deal.dealId} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {deal.dealName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Basic Property Info */}
            <tr className="bg-gray-50">
              <td className="px-6 py-3 text-sm font-medium text-gray-900">
                Strategy
              </td>
              {dealMetrics.map((deal) => (
                <td key={deal.dealId} className="px-6 py-3 text-sm text-gray-500">
                  {deal.strategy}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-3 text-sm font-medium text-gray-900">
                Address
              </td>
              {dealMetrics.map((deal) => (
                <td key={deal.dealId} className="px-6 py-3 text-sm text-gray-500">
                  {deal.address || 'Not specified'}
                </td>
              ))}
            </tr>
            
            {/* Financial Metrics */}
            {metricDefinitions.map((metric, idx) => {
              const bestValueIdx = getBestValueIndex(
                metric.key, 
                // Lower is better for purchase price and gross rent multiplier
                !['purchasePrice', 'grossRentMultiplier'].includes(metric.key)
              );

              return (
                <tr key={metric.key} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    {metric.label}
                  </td>
                  {dealMetrics.map((deal, dealIdx) => {
                    const value = (deal as any)[metric.key];
                    const isBest = dealIdx === bestValueIdx && dealMetrics.length > 1;
                    
                    return (
                      <td 
                        key={deal.dealId} 
                        className={`px-6 py-3 text-sm ${
                          isBest 
                            ? 'font-bold text-grass' 
                            : metric.key === 'monthlyCashFlow' && value < 0 
                              ? 'text-red-500'
                              : 'text-gray-500'
                        }`}
                      >
                        {metric.format(value)}
                        {isBest && (
                          <span className="ml-1.5 text-xs bg-grass/10 text-grass px-1.5 py-0.5 rounded">
                            Best
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  // Expenses Section
  const renderExpenses = () => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-navy mb-3">Expenses</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expense
              </th>
              {dealMetrics.map((deal) => (
                <th key={deal.dealId} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {deal.dealName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenseMetrics.map((metric, idx) => {
              const bestValueIdx = getBestExpenseIndex(metric.key);
              
              return (
                <tr key={metric.key} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    {metric.label}
                  </td>
                  {dealMetrics.map((deal, dealIdx) => {
                    const value = (deal.expenses as any)[metric.key];
                    const isBest = dealIdx === bestValueIdx && dealMetrics.length > 1;
                    
                    return (
                      <td 
                        key={deal.dealId} 
                        className={`px-6 py-3 text-sm ${
                          isBest ? 'font-bold text-grass' : 'text-gray-500'
                        }`}
                      >
                        {metric.format(value)}
                        {isBest && (
                          <span className="ml-1.5 text-xs bg-grass/10 text-grass px-1.5 py-0.5 rounded">
                            Best
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  // Mortgage Section
  const renderMortgage = () => (
    <div>
      <h3 className="text-lg font-semibold text-navy mb-3">Financing</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Financing Detail
              </th>
              {dealMetrics.map((deal) => (
                <th key={deal.dealId} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {deal.dealName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mortgageMetrics.map((metric, idx) => (
              <tr key={metric.key} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="px-6 py-3 text-sm font-medium text-gray-900">
                  {metric.label}
                </td>
                {dealMetrics.map((deal) => (
                  <td key={deal.dealId} className="px-6 py-3 text-sm text-gray-500">
                    {metric.format((deal.mortgage as any)[metric.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-navy mb-6">Deal Comparison</h2>
      
      {renderPropertyMetrics()}
      {renderExpenses()}
      {renderMortgage()}
      
      <div className="mt-8 text-sm text-gray-500">
        <p>Note: "Best" indicators highlight the most favorable metric among the compared deals.</p>
      </div>
    </div>
  );
};

export default ComparisonTable;
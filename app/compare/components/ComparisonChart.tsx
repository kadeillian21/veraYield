'use client';

import React, { useEffect, useRef } from 'react';
import { DealData } from '../../components/dealAnalyzer/DealAnalyzer';
import { Chart, ChartConfiguration, ChartData, ChartTypeRegistry } from 'chart.js/auto';

interface ComparisonChartProps {
  deals: DealData[];
  selectedDeals: string[];
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ deals, selectedDeals }) => {
  const cashFlowChartRef = useRef<HTMLCanvasElement | null>(null);
  const roiChartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<{
    cashFlow?: Chart<keyof ChartTypeRegistry>, 
    roi?: Chart<keyof ChartTypeRegistry>
  }>({});
  
  // Filter to only selected deals and ensure they exist
  const dealsToCompare = deals.filter(deal => selectedDeals.includes(deal.id));
  
  useEffect(() => {
    if (dealsToCompare.length === 0) return;
    
    // Colors for different deals
    const colors = [
      'rgba(54, 162, 235, 1)',   // Blue
      'rgba(255, 99, 132, 1)',   // Red
      'rgba(75, 192, 192, 1)',   // Green
      'rgba(255, 159, 64, 1)',   // Orange
      'rgba(153, 102, 255, 1)',  // Purple
    ];
    
    // Generate data for charts
    const cashFlowData: ChartData = {
      labels: ['Monthly Cash Flow', 'Annual Cash Flow'],
      datasets: dealsToCompare.map((deal, index) => {
        // Calculate metrics for the deal
        const monthlyRent = deal.config.operation?.monthlyRent || 0;
        const annualRent = monthlyRent * 12;
        
        const purchaseLoanAmount = deal.config.acquisition?.purchaseLoanAmount || 0;
        const purchaseLoanRate = deal.config.acquisition?.purchaseLoanRate || 0.05;
        const purchaseLoanTermYears = deal.config.acquisition?.purchaseLoanTermYears || 30;
        
        const annualMortgage = purchaseLoanAmount * 
                              purchaseLoanRate * 
                              (1 + (1 / (Math.pow(1 + purchaseLoanRate, 
                              purchaseLoanTermYears * 12) - 1))) * 12;
        
        // Estimated expenses
        const propertyTaxes = deal.config.operation?.propertyTaxes || 0;
        const insurance = deal.config.operation?.insurance || 0;
        const maintenance = deal.config.operation?.maintenance || 0;
        const utilities = deal.config.operation?.utilities || 0;
        const propertyManagement = (deal.config.operation?.propertyManagement || 0) / 100 * annualRent;
        
        const expenses = propertyTaxes + insurance + maintenance + utilities + propertyManagement;
        const annualCashFlow = annualRent - annualMortgage - expenses;
        const monthlyCashFlow = annualCashFlow / 12;
        
        return {
          label: deal.name || deal.address || `Deal ${index + 1}`,
          data: [monthlyCashFlow, annualCashFlow],
          backgroundColor: colors[index % colors.length],
          borderColor: colors[index % colors.length],
          borderWidth: 1
        };
      })
    };
    
    const roiData: ChartData = {
      labels: ['ROI', 'Cash on Cash', 'Cap Rate'],
      datasets: dealsToCompare.map((deal, index) => {
        // Calculate metrics for the deal
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
        
        // Estimated expenses
        const propertyTaxes = deal.config.operation?.propertyTaxes || 0;
        const insurance = deal.config.operation?.insurance || 0;
        const maintenance = deal.config.operation?.maintenance || 0;
        const utilities = deal.config.operation?.utilities || 0;
        const propertyManagement = (deal.config.operation?.propertyManagement || 0) / 100 * annualRent;
        
        const expenses = propertyTaxes + insurance + maintenance + utilities + propertyManagement;
        const annualCashFlow = annualRent - annualMortgage - expenses;
        const cashOnCash = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;
        
        // Calculate cap rate
        const netOperatingIncome = annualRent - expenses; // NOI = annual rent - expenses (excluding mortgage)
        const capRate = purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;
        
        return {
          label: deal.name || deal.address || `Deal ${index + 1}`,
          data: [roi, cashOnCash, capRate],
          backgroundColor: colors[index % colors.length],
          borderColor: colors[index % colors.length],
          borderWidth: 1
        };
      })
    };
    
    // Destroy existing chart instances to prevent memory leaks
    if (chartInstanceRef.current.cashFlow) {
      chartInstanceRef.current.cashFlow.destroy();
    }
    
    if (chartInstanceRef.current.roi) {
      chartInstanceRef.current.roi.destroy();
    }
    
    // Create cash flow chart
    if (cashFlowChartRef.current) {
      const cashFlowConfig: ChartConfiguration = {
        type: 'bar',
        data: cashFlowData,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Amount ($)'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Cash Flow Comparison',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(context.parsed.y);
                  }
                  return label;
                }
              }
            }
          }
        }
      };
      
      chartInstanceRef.current.cashFlow = new Chart(cashFlowChartRef.current, cashFlowConfig);
    }
    
    // Create ROI chart
    if (roiChartRef.current) {
      const roiConfig: ChartConfiguration = {
        type: 'bar',
        data: roiData,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Percentage (%)'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Return Metrics Comparison',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y.toFixed(2) + '%';
                  }
                  return label;
                }
              }
            }
          }
        }
      };
      
      chartInstanceRef.current.roi = new Chart(roiChartRef.current, roiConfig);
    }
    
    // Cleanup function
    return () => {
      if (chartInstanceRef.current.cashFlow) {
        chartInstanceRef.current.cashFlow.destroy();
      }
      
      if (chartInstanceRef.current.roi) {
        chartInstanceRef.current.roi.destroy();
      }
    };
  }, [dealsToCompare, selectedDeals]);
  
  if (dealsToCompare.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">Select deals to compare them.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-navy mb-6">Visual Comparison</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="min-h-[300px]">
          <canvas ref={cashFlowChartRef}></canvas>
        </div>
        <div className="min-h-[300px]">
          <canvas ref={roiChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default ComparisonChart;
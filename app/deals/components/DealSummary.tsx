'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DealData } from '../dealAnalyzer/DealAnalyzer';
import { 
  generateProjection, 
  ProjectionResult 
} from '../../../utils/brrrCalculator/projectionEngine';
import ROIComparisonChart from './ROIComparisonChart';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DealSummaryProps {
  dealData: DealData;
}

export default function DealSummary({
  dealData,
}: DealSummaryProps) {
  // Ref for PDF export
  const summaryRef = useRef<HTMLDivElement>(null);
  
  // State for projection results
  const [projection, setProjection] = useState<ProjectionResult | null>(null);
  
  // State for selected month (for monthly view)
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  
  // State for compare mode
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [compareMonth, setCompareMonth] = useState<number>(
    Math.min(dealData.config.projectionMonths, 12)
  );
  
  // State for PDF generation
  const [isExporting, setIsExporting] = useState<boolean>(false);
  
  // Generate projection when dealData changes
  useEffect(() => {
    try {
      const result = generateProjection(dealData.config);
      setProjection(result);
      
      // Update selected month if needed
      if (selectedMonth > result.monthlySnapshots.length) {
        setSelectedMonth(result.monthlySnapshots.length);
      }
      
      // Update compare month if needed
      if (compareMonth > result.monthlySnapshots.length) {
        setCompareMonth(result.monthlySnapshots.length);
      }
    } catch (error) {
      console.error('Error generating projection:', error);
    }
  }, [dealData, selectedMonth, compareMonth]);

  // Handle month selection
  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
  };
  
  // Handle compare month selection
  const handleCompareMonthChange = (month: number) => {
    setCompareMonth(month);
  };
  
  // Annualized returns are now calculated in the projection engine

  // Format percentage value
  const formatPercentage = (value: number): string => {
    return (value * 100).toFixed(2) + '%';
  };
  
  // Export to PDF function
  const handleExportToPDF = async () => {
    if (!projection) return;
    
    setIsExporting(true);
    
    try {
      // Create a date for the filename
      const date = new Date().toISOString().split('T')[0];
      const fileName = `${dealData.address || 'Deal'}-${date}.pdf`;
      
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });
      
      // Get page width and height
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Add header with property info
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 100); // Navy blue color
      doc.text('Investment Deal Summary', 40, 40);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Black
      doc.text(`Property: ${dealData.address || 'Unnamed Property'}`, 40, 60);
      doc.text(`Strategy: ${dealData.strategy}`, 40, 75);
      doc.text(`Date: ${date}`, 40, 90);
      
      // Add a line
      doc.setDrawColor(200, 200, 200);
      doc.line(40, 100, pageWidth - 40, 100);
      
      // Extract data for creating a proper structured PDF
      
      // Key Metrics Section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      let yPos = 130;
      doc.text('Key Metrics', 40, yPos);
      yPos += 20;
      
      const metrics = [
        { label: 'Total Investment', value: `$${projection.summary.totalInvestment.toLocaleString()}` },
        { label: 'Remaining Investment', value: `$${projection.summary.remainingInvestment.toLocaleString()}` },
        { label: 'Cash-on-Cash Return', value: formatPercentage(projection.summary.cashOnCashReturn) },
        { label: 'Internal Rate of Return', value: formatPercentage(projection.summary.internalRateOfReturn) },
        { label: 'Final Property Value', value: `$${projection.summary.finalPropertyValue.toLocaleString()}` },
        { label: 'Final Equity', value: `$${projection.summary.finalEquity.toLocaleString()}` },
        { label: 'Average Monthly Cash Flow', value: `$${projection.summary.averageMonthlyCashFlow.toFixed(2)}` },
        { label: 'BRRRR Status', value: projection.summary.successfulBRRRR ? 'Successful' : 'Partial' }
      ];
      
      // Create a table for metrics
      const metricsPerRow = 2;
      const cellWidth = (pageWidth - 80) / metricsPerRow;
      const cellHeight = 50;
      
      for (let i = 0; i < metrics.length; i += metricsPerRow) {
        for (let j = 0; j < metricsPerRow && i + j < metrics.length; j++) {
          const metric = metrics[i + j];
          const xPos = 40 + j * cellWidth;
          
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(metric.label, xPos, yPos);
          
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 100);
          doc.text(metric.value, xPos, yPos + 20);
        }
        yPos += cellHeight;
      }
      
      // Add Monthly View section
      yPos += 20;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Monthly View', 40, yPos);
      yPos += 20;
      
      // Selected Month
      doc.setFontSize(12);
      doc.text(`Month ${selectedMonth} ${selectedSnapshot.eventDescription ? `- ${selectedSnapshot.eventDescription}` : ''}`, 40, yPos);
      yPos += 20;
      
      const monthlyDetails = [
        { label: 'Property Value', value: `$${selectedSnapshot.propertyValue.toLocaleString()}` },
        { label: 'Equity', value: `$${selectedSnapshot.equity.toLocaleString()}` },
        { label: 'Loan Balance', value: `$${selectedSnapshot.loanBalance.toLocaleString()}` },
        { label: 'Remaining Investment', value: `$${selectedSnapshot.remainingInvestment.toLocaleString()}` },
        { label: 'Monthly Cash Flow', value: `$${selectedSnapshot.cashFlow.toFixed(2)}` },
        { label: 'Cash-on-Cash Return', value: formatPercentage(selectedSnapshot.cashOnCash) },
        { label: 'Annualized Return', value: formatPercentage(selectedSnapshot.annualizedReturn) }
      ];
      
      monthlyDetails.forEach(detail => {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(detail.label, 40, yPos);
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(detail.value, 250, yPos);
        yPos += 15;
      });
      
      // Add Timeline View
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = 40;
      } else {
        yPos += 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Timeline View', 40, yPos);
      yPos += 20;
      
      // Create table headers for timeline
      const headers = ['Year', 'Property Value', 'Cash Flow', 'Equity', 'Event'];
      const colWidths = [60, 100, 100, 100, 140];
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      let xPosition = 40;
      headers.forEach((header, i) => {
        doc.text(header, xPosition, yPos);
        xPosition += colWidths[i];
      });
      
      yPos += 15;
      doc.setDrawColor(200, 200, 200);
      doc.line(40, yPos - 10, pageWidth - 40, yPos - 10);
      
      // Filter timeline data to yearly events and refinance events
      const timelineData = projection.monthlySnapshots.filter(
        snapshot => snapshot.month % 12 === 0 || 
                   (snapshot.eventDescription && snapshot.eventDescription.includes('Refinanced'))
      );
      
      // Populate timeline table
      doc.setFontSize(9);
      timelineData.forEach(snapshot => {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 40;
          
          // Redraw headers on new page
          xPosition = 40;
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          headers.forEach((header, i) => {
            doc.text(header, xPosition, yPos);
            xPosition += colWidths[i];
          });
          
          yPos += 15;
          doc.setDrawColor(200, 200, 200);
          doc.line(40, yPos - 10, pageWidth - 40, yPos - 10);
        }
        
        xPosition = 40;
        
        // Year/Month column
        if (snapshot.month % 12 === 0) {
          doc.text(`Year ${snapshot.month / 12}`, xPosition, yPos);
        } else {
          doc.text(`Month ${snapshot.month}`, xPosition, yPos);
        }
        xPosition += colWidths[0];
        
        // Property Value column
        doc.text(`$${snapshot.propertyValue.toLocaleString()}`, xPosition, yPos);
        xPosition += colWidths[1];
        
        // Cash Flow column
        doc.text(`$${snapshot.cashFlow.toFixed(2)}`, xPosition, yPos);
        xPosition += colWidths[2];
        
        // Equity column
        doc.text(`$${snapshot.equity.toLocaleString()}`, xPosition, yPos);
        xPosition += colWidths[3];
        
        // Event column
        if (snapshot.eventDescription) {
          doc.text(snapshot.eventDescription, xPosition, yPos);
        }
        
        yPos += 15;
      });
      
      // Add Final Analysis section
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = 40;
      } else {
        yPos += 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Final Analysis', 40, yPos);
      yPos += 20;
      
      doc.setFontSize(10);
      const analysisItems = [
        {
          title: 'BRRRR Status:',
          content: projection.summary.successfulBRRRR 
            ? 'This deal successfully recycles your capital, allowing you to reinvest in your next property.' 
            : 'This is a partial BRRRR deal. You will still have some capital invested in the property.'
        },
        {
          title: 'Cash Flow:',
          content: projection.summary.averageMonthlyCashFlow >= 300
            ? 'This deal has strong cash flow - it should provide good monthly income.'
            : projection.summary.averageMonthlyCashFlow >= 100
            ? 'This deal has moderate cash flow - it should cover expenses with some profit.'
            : projection.summary.averageMonthlyCashFlow >= 0
            ? 'This deal has minimal cash flow - it covers costs but provides limited income.'
            : 'This deal has negative cash flow - you may need to contribute additional funds.'
        },
        {
          title: 'Return on Investment:',
          content: projection.summary.internalRateOfReturn >= 0.15
            ? 'This deal has an excellent IRR of ' + formatPercentage(projection.summary.internalRateOfReturn) + '.'
            : projection.summary.internalRateOfReturn >= 0.10
            ? 'This deal has a good IRR of ' + formatPercentage(projection.summary.internalRateOfReturn) + '.'
            : 'This deal has a modest IRR of ' + formatPercentage(projection.summary.internalRateOfReturn) + '.'
        },
        {
          title: 'Key Refinance Events:',
          content: dealData.config.refinanceEvents && dealData.config.refinanceEvents.length > 0
            ? `You've planned ${dealData.config.refinanceEvents.length} refinance event(s) with the first at month ${dealData.config.refinanceEvents[0].month}.`
            : 'You have not scheduled any refinance events.'
        }
      ];
      
      analysisItems.forEach(item => {
        // Check if we need a new page
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 40;
        }
        
        doc.setTextColor(0, 0, 100);
        doc.setFontSize(11);
        doc.text(item.title, 40, yPos);
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        
        // Split long text into multiple lines
        const maxWidth = pageWidth - 80;
        const lines = doc.splitTextToSize(item.content, maxWidth);
        doc.text(lines, 40, yPos + 15);
        
        yPos += 15 + (lines.length * 12);
      });
      
      // Save the PDF
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Return loading state if projection not ready
  if (!projection) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy mx-auto"></div>
          <p className="mt-4 text-gray-600">Calculating projection...</p>
        </div>
      </div>
    );
  }

  // Get the snapshot for the selected month
  const selectedSnapshot = projection.monthlySnapshots[selectedMonth - 1];
  
  // Get the snapshot for the compare month
  const compareSnapshot = compareMode 
    ? projection.monthlySnapshots[compareMonth - 1] 
    : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">
          Deal Summary: {dealData.name}
        </h3>
        
        <button
          onClick={handleExportToPDF}
          disabled={isExporting}
          data-export-pdf
          className={`btn ${isExporting ? 'btn-disabled' : 'btn-primary'} flex items-center gap-2`}
        >
          {isExporting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-b-transparent rounded-full"></div>
              Exporting...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </>
          )}
        </button>
      </div>
      
      <div ref={summaryRef} className="space-y-6">
      
      {/* Key Metrics */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-medium text-black">Key Metrics</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Investment</p>
            <p className="text-xl font-bold text-navy">
              ${projection.summary.totalInvestment.toLocaleString()}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Remaining Investment</p>
            <p className="text-xl font-bold text-black">
              ${projection.summary.remainingInvestment.toLocaleString()}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Cash-on-Cash Return</p>
            <p className="text-xl font-bold text-navy">
              {formatPercentage(projection.summary.cashOnCashReturn)}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Internal Rate of Return</p>
            <p className="text-xl font-bold text-navy">
              {formatPercentage(projection.summary.internalRateOfReturn)}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Final Property Value</p>
            <p className="text-xl font-bold text-navy">
              ${projection.summary.finalPropertyValue.toLocaleString()}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Final Equity</p>
            <p className="text-xl font-bold text-navy">
              ${projection.summary.finalEquity.toLocaleString()}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Average Monthly Cash Flow</p>
            <p className="text-xl font-bold text-black">
              ${projection.summary.averageMonthlyCashFlow.toFixed(2)}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">BRRRR Status</p>
            <p className="text-xl font-bold text-black">
              {projection.summary.successfulBRRRR ? 'Successful' : 'Partial'}
            </p>
          </div>
        </div>
      </div>
      
      {/* ROI Comparison Chart */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <ROIComparisonChart 
          projectionMonths={projection.monthlySnapshots.length}
          totalInvestment={projection.summary.totalInvestment}
          monthlySnapshots={projection.monthlySnapshots}
        />
      </div>
      
      {/* Monthly View */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-medium text-gray-800">Monthly View</h4>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 flex items-center">
              <input 
                type="checkbox" 
                checked={compareMode}
                onChange={() => setCompareMode(!compareMode)}
                className="mr-2"
              />
              Compare Months
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Month Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Month
            </label>
            <div className="flex items-center">
              <input 
                type="range" 
                min="1" 
                max={projection.monthlySnapshots.length}
                value={selectedMonth}
                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                className="w-full mr-2"
              />
              <span className="text-gray-700 min-w-14 text-center">
                Month {selectedMonth}
              </span>
            </div>
          </div>
          
          {/* Compare Month Selector (if in compare mode) */}
          {compareMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compare with Month
              </label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  min="1" 
                  max={projection.monthlySnapshots.length}
                  value={compareMonth}
                  onChange={(e) => handleCompareMonthChange(parseInt(e.target.value))}
                  className="w-full mr-2"
                />
                <span className="text-gray-700 min-w-14 text-center">
                  Month {compareMonth}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Month Details */}
        <div className={`grid ${compareMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6 mt-4`}>
          {/* Selected Month */}
          <div className="bg-white rounded-lg shadow p-4">
            <h5 className="font-medium text-lg text-gray-800 mb-2">
              Month {selectedMonth} {selectedSnapshot.eventDescription ? `- ${selectedSnapshot.eventDescription}` : ''}
            </h5>
            
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Property Value</span>
                <span className="font-medium">${selectedSnapshot.propertyValue.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Equity</span>
                <span className="font-medium">${selectedSnapshot.equity.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Loan Balance</span>
                <span className="font-medium">${selectedSnapshot.loanBalance.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Remaining Investment</span>
                <span className="font-medium">${selectedSnapshot.remainingInvestment.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Monthly Cash Flow</span>
                <span className="font-medium text-black">
                  ${selectedSnapshot.cashFlow.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Cash-on-Cash Return</span>
                <span className="font-medium">
                  {formatPercentage(selectedSnapshot.cashOnCash)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Annualized Return</span>
                <span className="font-medium text-navy">
                  {formatPercentage(selectedSnapshot.annualizedReturn)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Compare Month (if in compare mode) */}
          {compareMode && compareSnapshot && (
            <div className="bg-white rounded-lg shadow p-4">
              <h5 className="font-medium text-lg text-gray-800 mb-2">
                Month {compareMonth} {compareSnapshot.eventDescription ? `- ${compareSnapshot.eventDescription}` : ''}
              </h5>
              
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Property Value</span>
                  <div className="flex items-center">
                    <span className="font-medium">${compareSnapshot.propertyValue.toLocaleString()}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {compareSnapshot.propertyValue - selectedSnapshot.propertyValue !== 0 && (
                        <>
                          {compareSnapshot.propertyValue > selectedSnapshot.propertyValue ? '+' : ''}
                          ${(compareSnapshot.propertyValue - selectedSnapshot.propertyValue).toLocaleString()}
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Equity</span>
                  <div className="flex items-center">
                    <span className="font-medium">${compareSnapshot.equity.toLocaleString()}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {compareSnapshot.equity - selectedSnapshot.equity !== 0 && (
                        <>
                          {compareSnapshot.equity > selectedSnapshot.equity ? '+' : ''}
                          ${(compareSnapshot.equity - selectedSnapshot.equity).toLocaleString()}
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Loan Balance</span>
                  <div className="flex items-center">
                    <span className="font-medium">${compareSnapshot.loanBalance.toLocaleString()}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {compareSnapshot.loanBalance - selectedSnapshot.loanBalance !== 0 && (
                        <>
                          {compareSnapshot.loanBalance > selectedSnapshot.loanBalance ? '+' : ''}
                          ${(compareSnapshot.loanBalance - selectedSnapshot.loanBalance).toLocaleString()}
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Remaining Investment</span>
                  <div className="flex items-center">
                    <span className="font-medium">${compareSnapshot.remainingInvestment.toLocaleString()}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {compareSnapshot.remainingInvestment - selectedSnapshot.remainingInvestment !== 0 && (
                        <>
                          {compareSnapshot.remainingInvestment > selectedSnapshot.remainingInvestment ? '+' : ''}
                          ${(compareSnapshot.remainingInvestment - selectedSnapshot.remainingInvestment).toLocaleString()}
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Monthly Cash Flow</span>
                  <div className="flex items-center">
                    <span className="font-medium text-black">
                      ${compareSnapshot.cashFlow.toFixed(2)}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {compareSnapshot.cashFlow - selectedSnapshot.cashFlow !== 0 && (
                        <>
                          {compareSnapshot.cashFlow > selectedSnapshot.cashFlow ? '+' : ''}
                          ${(compareSnapshot.cashFlow - selectedSnapshot.cashFlow).toFixed(2)}
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Cash-on-Cash Return</span>
                  <div className="flex items-center">
                    <span className="font-medium">
                      {formatPercentage(compareSnapshot.cashOnCash)}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {compareSnapshot.cashOnCash - selectedSnapshot.cashOnCash !== 0 && (
                        <>
                          {compareSnapshot.cashOnCash > selectedSnapshot.cashOnCash ? '+' : ''}
                          {formatPercentage(compareSnapshot.cashOnCash - selectedSnapshot.cashOnCash)}
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Annualized Return</span>
                  <div className="flex items-center">
                    <span className="font-medium text-navy">
                      {formatPercentage(compareSnapshot.annualizedReturn)}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {compareSnapshot.annualizedReturn - selectedSnapshot.annualizedReturn !== 0 && (
                        <>
                          {compareSnapshot.annualizedReturn > selectedSnapshot.annualizedReturn ? '+' : ''}
                          {formatPercentage(compareSnapshot.annualizedReturn - selectedSnapshot.annualizedReturn)}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Timeline View */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-black">Timeline View</h4>
        
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Year
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Property Value
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Cash Flow
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Cumulative Cash Flow
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Equity
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Event
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projection.monthlySnapshots.map((snapshot, index) => {
                // Only show months that are at yearly intervals (month 12, 24, 36, etc.)
                if (snapshot.month % 12 === 0) {
                  const yearNumber = snapshot.month / 12;
                  return (
                    <tr key={index} className={snapshot.month === selectedMonth ? 'bg-blue-50' : ''}>
                      <td className="px-4 py-2 whitespace-nowrap text-black font-medium">
                        Year {yearNumber}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-black">
                        ${snapshot.propertyValue.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="text-black">
                          ${snapshot.cashFlow.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="text-black">
                          ${snapshot.totalCashFlow.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-black">
                        ${snapshot.equity.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-black">
                        {snapshot.eventDescription || ''}
                      </td>
                    </tr>
                  );
                }
                // Also show any month with a significant event (like refinance)
                else if (snapshot.eventDescription && snapshot.eventDescription.includes('Refinanced')) {
                  return (
                    <tr key={index} className={snapshot.month === selectedMonth ? 'bg-blue-50' : ''}>
                      <td className="px-4 py-2 whitespace-nowrap text-black font-medium">
                        Month {snapshot.month}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-black">
                        ${snapshot.propertyValue.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="text-black">
                          ${snapshot.cashFlow.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="text-black">
                          ${snapshot.totalCashFlow.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-black">
                        ${snapshot.equity.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-black font-medium">
                        {snapshot.eventDescription || ''}
                      </td>
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Final Analysis */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-black mb-4">Final Analysis</h4>
        
        <div className="space-y-4">
          <p className="text-black">
            <strong>BRRRR Status:</strong>{' '}
            {projection.summary.successfulBRRRR 
              ? 'This deal successfully recycles your capital, allowing you to reinvest in your next property.' 
              : 'This is a partial BRRRR deal. You will still have some capital invested in the property.'}
          </p>
          
          <p className="text-black">
            <strong>Cash Flow:</strong>{' '}
            {projection.summary.averageMonthlyCashFlow >= 300
              ? 'This deal has strong cash flow - it should provide good monthly income.'
              : projection.summary.averageMonthlyCashFlow >= 100
              ? 'This deal has moderate cash flow - it should cover expenses with some profit.'
              : projection.summary.averageMonthlyCashFlow >= 0
              ? 'This deal has minimal cash flow - it covers costs but provides limited income.'
              : 'This deal has negative cash flow - you may need to contribute additional funds.'}
          </p>
          
          <p className="text-black">
            <strong>Return on Investment:</strong>{' '}
            {projection.summary.internalRateOfReturn >= 0.15
              ? 'This deal has an excellent IRR of ' + formatPercentage(projection.summary.internalRateOfReturn) + '.'
              : projection.summary.internalRateOfReturn >= 0.10
              ? 'This deal has a good IRR of ' + formatPercentage(projection.summary.internalRateOfReturn) + '.'
              : 'This deal has a modest IRR of ' + formatPercentage(projection.summary.internalRateOfReturn) + '.'}
          </p>
          
          <p className="text-blue-700">
            <strong>Key Refinance Events:</strong>{' '}
            {dealData.config.refinanceEvents && dealData.config.refinanceEvents.length > 0
              ? `You've planned ${dealData.config.refinanceEvents.length} refinance event(s) with the first at month ${dealData.config.refinanceEvents[0].month}.`
              : 'You have not scheduled any refinance events.'}
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
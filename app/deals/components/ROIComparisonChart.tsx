'use client';

import React, { useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Baseline investment comparison data
const BASELINE_INVESTMENTS = {
  SP500: { label: 'S&P 500', color: 'rgba(54, 162, 235, 1)', annualizedReturn: 0.10 }, // 10% historical average
  HYSA: { label: 'High-Yield Savings', color: 'rgba(75, 192, 192, 1)', annualizedReturn: 0.04 }, // 4% current rate
  CHECKING: { label: 'Checking Account', color: 'rgba(201, 203, 207, 1)', annualizedReturn: 0.001 }, // 0.1% avg
  GOLD: { label: 'Gold', color: 'rgba(255, 205, 86, 1)', annualizedReturn: 0.06 }, // ~6% long term
  BONDS: { label: 'T-Bonds', color: 'rgba(153, 102, 255, 1)', annualizedReturn: 0.035 } // ~3.5% avg
};

interface ROIComparisonChartProps {
  projectionMonths: number;
  totalInvestment: number;
  monthlySnapshots: Array<{
    month: number;
    totalReturn: number;
    annualizedReturn: number;
    equity: number;
    totalCashFlow: number;
    propertyValue: number;
    remainingInvestment: number;
  }>;
}

export default function ROIComparisonChart({
  projectionMonths,
  totalInvestment,
  monthlySnapshots
}: ROIComparisonChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [visibleBaselines, setVisibleBaselines] = useState<Record<string, boolean>>({
    SP500: true,
    HYSA: true,
    CHECKING: false,
    GOLD: true,
    BONDS: false
  });
  
  // Create labels for months or years
  const labels = Array.from({ length: projectionMonths }, (_, i) => `M${i + 1}`);
  
  // Calculate annualized return rates for alternative investments
  const calculateBaselineReturns = (month: number, annualizedReturn: number): number => {
    const yearsElapsed = (month + 1) / 12;
    const futureValue = totalInvestment * Math.pow(1 + annualizedReturn, yearsElapsed);
    const totalROI = (futureValue - totalInvestment) / totalInvestment;
    return Number(totalROI.toFixed(4));
  };

  // Create datasets for chart
  const propertyReturns = monthlySnapshots.map((snapshot) => snapshot.annualizedReturn * 100);
  
  const toggleBaseline = (baselineKey: string) => {
    setVisibleBaselines(prev => ({
      ...prev,
      [baselineKey]: !prev[baselineKey]
    }));
  };

  // Update selected month when user interacts with chart
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChartClick = (event: any) => {
    const chart = chartRef.current;
    if (!chart) return;
    
    const activePoints = chart.getElementsAtEventForMode(
      event.native,
      'nearest',
      { intersect: true },
      false
    );
    
    if (activePoints.length > 0) {
      const index = activePoints[0].index;
      setSelectedMonth(index + 1);
    }
  };

  // Chart data
  const data = {
    labels,
    datasets: [
      {
        label: 'Your Property',
        data: propertyReturns,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
        borderWidth: 2,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pointRadius: (ctx: any) => {
          const index = ctx.dataIndex;
          return index + 1 === selectedMonth ? 6 : 3;
        },
        pointHoverRadius: 8
      },
      ...Object.entries(BASELINE_INVESTMENTS)
        .filter(([key]) => visibleBaselines[key])
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(([key, baseline]) => ({
          label: baseline.label,
          data: monthlySnapshots.map((_, i) => 
            calculateBaselineReturns(i, baseline.annualizedReturn) * 100
          ),
          borderColor: baseline.color,
          backgroundColor: baseline.color.replace('1)', '0.2)'),
          borderDash: [5, 5],
          tension: 0.1,
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 3
        }))
    ]
  };

  // Chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleChartClick,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}%`;
          }
        }
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        },
        title: {
          display: true,
          text: 'Annualized Return Rate',
          color: '#666',
          font: {
            weight: 'bold'
          }
        }
      },
      x: {
        ticks: {
          maxTicksLimit: Math.min(projectionMonths, 12)
        },
        title: {
          display: true,
          text: 'Month',
          color: '#666',
          font: {
            weight: 'bold'
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-medium text-gray-800">Investment Return Comparison</h4>
        <div className="text-sm">
          {selectedMonth && monthlySnapshots[selectedMonth - 1] && (
            <span className="font-medium">
              Month {selectedMonth}: {(propertyReturns[selectedMonth - 1]).toFixed(2)}% annualized return
            </span>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(BASELINE_INVESTMENTS).map(([key, baseline]) => (
          <button
            key={key}
            onClick={() => toggleBaseline(key)}
            className={`text-xs py-1 px-2 rounded-full border transition-colors ${
              visibleBaselines[key]
                ? `bg-${baseline.color.replace('rgba(', '').replace(')', '')} text-white`
                : 'bg-white text-gray-600 border-gray-300'
            }`}
            style={{
              backgroundColor: visibleBaselines[key] ? baseline.color : 'white',
              borderColor: baseline.color,
              color: visibleBaselines[key] ? 'white' : 'black'
            }}
          >
            {baseline.label}
          </button>
        ))}
      </div>
      
      <div className="h-64">
        <Line ref={chartRef} data={data} options={options} />
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Drag to select month
        </label>
        <input 
          type="range" 
          min="1" 
          max={projectionMonths}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      
      <div className="bg-gray-50 p-3 rounded-md mt-2">
        <p className="text-sm text-gray-600">
          <strong>Performance at Month {selectedMonth}:</strong>
          {monthlySnapshots[selectedMonth - 1] && (
            <>
              <br />
              - Your property: <span className="font-semibold">{propertyReturns[selectedMonth - 1].toFixed(2)}%</span> annualized return
              {Object.entries(BASELINE_INVESTMENTS)
                .filter(([key]) => visibleBaselines[key])
                .map(([key, baseline]) => {
                  const return_value = calculateBaselineReturns(selectedMonth - 1, baseline.annualizedReturn) * 100;
                  return (
                    <React.Fragment key={key}>
                      <br />
                      - {baseline.label}: <span className="font-semibold">{return_value.toFixed(2)}%</span> annualized return
                    </React.Fragment>
                  );
                })
              }
            </>
          )}
        </p>
      </div>
    </div>
  );
}
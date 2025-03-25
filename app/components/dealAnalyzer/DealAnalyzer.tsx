'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import StrategySelector from './StrategySelector';
import Timeline from '../brrrCalculator/Timeline';
import PropertyInfo from '../brrrCalculator/PropertyInfo';
import AcquisitionDetails from '../brrrCalculator/AcquisitionDetails';
import RehabDetails from '../brrrCalculator/RehabDetails';
import RentalDetails from '../brrrCalculator/RentalDetails';
import RefinanceDetails from '../brrrCalculator/RefinanceDetails';
import ProjectionSettings from '../brrrCalculator/ProjectionSettings';
import DealSummary from '../brrrCalculator/DealSummary';
import ShortTermRentalIncome, { STRIncome } from './ShortTermRentalIncome';
import STRExpenses, { STRExpenses as STRExpensesType } from './STRExpenses';
import MultiFamilyUnits, { RentalUnit } from './MultiFamilyUnits';
import HouseHackDetails, { HouseHackConfiguration } from './HouseHackDetails';
import { ProjectionConfig } from '../../utils/brrrCalculator/projectionEngine';

// Investment strategies supported by the calculator
export type InvestmentStrategy = 'brrrr' | 'longTermRental' | 'shortTermRental' | 'multifamily' | 'houseHack';

// Strategy-specific step configurations
const strategySteps: Record<InvestmentStrategy, Array<{ id: string; label: string }>> = {
  brrrr: [
    { id: 'property', label: 'Property Info' },
    { id: 'acquisition', label: 'Acquisition' },
    { id: 'rehab', label: 'Rehab' },
    { id: 'rental', label: 'Rental' },
    { id: 'refinance', label: 'Refinance' },
    { id: 'projection', label: 'Projection' },
    { id: 'summary', label: 'Summary' }
  ],
  longTermRental: [
    { id: 'property', label: 'Property Info' },
    { id: 'acquisition', label: 'Acquisition' },
    { id: 'rental', label: 'Rental' },
    { id: 'projection', label: 'Projection' },
    { id: 'summary', label: 'Summary' }
  ],
  shortTermRental: [
    { id: 'property', label: 'Property Info' },
    { id: 'acquisition', label: 'Acquisition' },
    { id: 'str-income', label: 'STR Income' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'projection', label: 'Projection' },
    { id: 'summary', label: 'Summary' }
  ],
  multifamily: [
    { id: 'property', label: 'Property Info' },
    { id: 'acquisition', label: 'Acquisition' },
    { id: 'units', label: 'Units' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'projection', label: 'Projection' },
    { id: 'summary', label: 'Summary' }
  ],
  houseHack: [
    { id: 'property', label: 'Property Info' },
    { id: 'acquisition', label: 'Acquisition' },
    { id: 'personal-unit', label: 'Your Unit' },
    { id: 'rental-units', label: 'Rental Units' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'projection', label: 'Projection' },
    { id: 'summary', label: 'Summary' }
  ]
};

export type DealData = {
  id: string;
  name: string;
  address: string;
  strategy: InvestmentStrategy;
  createdAt: Date;
  updatedAt: Date;
  config: ExtendedProjectionConfig;
};

// Extended type for our all-strategy config
interface ExtendedProjectionConfig extends ProjectionConfig {
  // STR specific fields
  strIncome?: STRIncome;
  strExpenses?: STRExpensesType;
  // Multi-family specific fields
  units?: RentalUnit[];
  // House hack specific fields
  houseHack?: HouseHackConfiguration;
  // General
  purchasePrice?: number;
}

// Default projection configuration
const defaultConfig: ExtendedProjectionConfig = {
  acquisition: {
    purchasePrice: 100000, // Setting a default purchase price
    closingCosts: 3000,
    rehabCosts: 20000,
    rehabDurationMonths: 2,
    purchaseLoanAmount: 80000, // Setting a default loan amount (80% LTV)
    purchaseLoanRate: 0.07,
    purchaseLoanTermYears: 30,
    otherInitialCosts: 0,
    includeHoldingCosts: {
      mortgage: true,
      taxes: true,
      insurance: true,
      maintenance: true,
      propertyManagement: false,
      utilities: true,
      other: false
    }
  },
  operation: {
    monthlyRent: 0,
    otherMonthlyIncome: 0,
    propertyTaxes: 0,
    insurance: 0,
    maintenance: 0,
    propertyManagement: 8, // percentage
    utilities: 0,
    vacancyRate: 5, // percentage
    otherExpenses: 0
  },
  projectionMonths: 60,
  refinanceEvents: [],
  propertyValueChanges: [],
  rentChangeEvents: [],
  expenseChangeEvents: [],
  capitalExpenseEvents: [],
  
  // Short-term rental specific defaults
  strIncome: {
    peakSeasonDaily: 150,
    peakSeasonOccupancy: 90,
    peakSeasonMonths: [6, 7, 8], // Summer months
    midSeasonDaily: 100,
    midSeasonOccupancy: 70,
    midSeasonMonths: [4, 5, 9, 10], // Spring & Fall
    lowSeasonDaily: 80,
    lowSeasonOccupancy: 50,
    lowSeasonMonths: [1, 2, 3, 11, 12], // Winter months
    cleaningFee: 75,
    otherFees: 25,
    platformFee: 3 // percentage
  },
  strExpenses: {
    propertyManagementFee: 20, // percentage
    cleaningCosts: 85, // per turnover
    suppliesPerMonth: 50,
    utilityExpenses: 200,
    propertyTaxes: 2400, // annual
    insurance: 1800, // annual
    furnitureReplacementPercent: 5, // percentage of revenue
    maintenancePercent: 3, // percentage of revenue
    advertisingPerMonth: 50,
    subscriptionServices: 30, // per month
    otherExpenses: 0 // per month
  },
  
  // Multi-family specific defaults
  units: [],
  
  // House hack specific defaults
  houseHack: {
    ownerUnit: {
      unitNumber: 'A',
      bedrooms: 2,
      bathrooms: 1,
      sqft: 900,
      marketRent: 1200,
      personalUsage: 100,
      occupancyRate: 95
    },
    currentHousingCost: 1500,
    personalUtilities: 150,
    combinedUtilities: 100,
    combinedInsurance: 1200,
    combinedPropertyTax: 2400,
    rentalUnits: [],
    futurePlan: 'stay',
    futurePropertyValueChange: 3,
    futureDateOfChange: 12
  },
  
  // Common property price reference
  purchasePrice: 0
};

export default function DealAnalyzer() {
  // State for the selected investment strategy
  const [selectedStrategy, setSelectedStrategy] = useState<InvestmentStrategy | null>(null);
  
  // State for the current step in the process
  const [currentStep, setCurrentStep] = useState(0);
  
  // State for the deal data
  const [dealData, setDealData] = useState<DealData>({
    id: uuidv4(),
    name: '',
    address: '',
    strategy: 'longTermRental',
    createdAt: new Date(),
    updatedAt: new Date(),
    config: defaultConfig
  });

  // State for saved deals (would normally be in a database)
  const [savedDeals, setSavedDeals] = useState<DealData[]>([]);
  
  // State to control whether to show the saved deals grid
  const [showSavedDeals, setShowSavedDeals] = useState(false);

  // Reset step when strategy changes
  useEffect(() => {
    if (selectedStrategy) {
      setCurrentStep(0);
      setDealData(prev => ({
        ...prev,
        strategy: selectedStrategy
      }));
    }
  }, [selectedStrategy]);

  // Load saved deals from localStorage on component mount
  useEffect(() => {
    const savedDealsJSON = localStorage.getItem('investmentDeals');
    if (savedDealsJSON) {
      try {
        const parsed = JSON.parse(savedDealsJSON);
        // Convert string dates back to Date objects
        const parsedWithDates = parsed.map((deal: Record<string, unknown>) => ({
          ...deal,
          createdAt: new Date(String(deal.createdAt)),
          updatedAt: new Date(String(deal.updatedAt))
        }));
        setSavedDeals(parsedWithDates);
      } catch (error) {
        console.error('Failed to parse saved deals', error);
      }
    }
  }, []);

  // Save deals to localStorage when savedDeals changes
  useEffect(() => {
    if (savedDeals.length > 0) {
      localStorage.setItem('investmentDeals', JSON.stringify(savedDeals));
    }
  }, [savedDeals]);

  // Helper to get display name for a strategy
  const getStrategyDisplayName = (strategy: InvestmentStrategy): string => {
    const names: Record<InvestmentStrategy, string> = {
      brrrr: 'BRRRR',
      longTermRental: 'Long-Term Rental',
      shortTermRental: 'Short-Term Rental',
      multifamily: 'Multi-Family',
      houseHack: 'House Hack'
    };
    return names[strategy];
  };

  // Get steps for current strategy
  const getStepsForStrategy = (): Array<{ id: string; label: string }> => {
    return selectedStrategy ? strategySteps[selectedStrategy] : [];
  };

  // Handle moving to the next step
  const handleNext = () => {
    const steps = getStepsForStrategy();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle moving to the previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Jump to a specific step
  const jumpToStep = (stepIndex: number) => {
    const steps = getStepsForStrategy();
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  // Update deal data
  const updateDealData = (updates: Partial<DealData>) => {
    // Prevent circular updates - this function should only be updating dealData state
    // and not causing side effects that would trigger more state updates
    setDealData(prev => {
      // If the update includes changes to config.acquisition and config.purchasePrice,
      // make sure we don't create a circular update loop
      const newUpdates = { ...updates };
      
      if (newUpdates.config && 
          newUpdates.config.acquisition && 
          newUpdates.config.purchasePrice !== undefined && 
          newUpdates.config.acquisition.purchasePrice === newUpdates.config.purchasePrice) {
        // Don't update purchasePrice if it's the same as the acquisition.purchasePrice
        // to avoid circular updates
        const { ...restConfig } = newUpdates.config;
        newUpdates.config = restConfig;
      }
      
      // Create new object with updates applied
      const newData = {
        ...prev,
        ...newUpdates,
        updatedAt: new Date()
      };
      
      return newData;
    });
  };

  // Save the current deal
  const saveDeal = async () => {
    try {
      const updatedDeal = {
        ...dealData,
        updatedAt: new Date()
      };
      
      // Save to local storage for backup
      const existingDealIndex = savedDeals.findIndex(deal => deal.id === dealData.id);
      
      if (existingDealIndex >= 0) {
        // Update existing deal
        const updatedDeals = [...savedDeals];
        updatedDeals[existingDealIndex] = updatedDeal;
        setSavedDeals(updatedDeals);
      } else {
        // Add new deal
        setSavedDeals([...savedDeals, updatedDeal]);
      }
      
      // NOTE: API implementation is commented out for this standalone app
      // In a real app, you would save to a database via API
      /*
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDeal)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save deal to database');
      }
      
      const responseData = await response.json();
      console.log('Deal saved to database:', responseData);
      */
      
      alert('Deal saved successfully to localStorage!');
    } catch (error) {
      console.error('Error saving deal:', error);
      alert(`Error saving deal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Create a new deal
  const createNewDeal = () => {
    setSelectedStrategy(null);
    setCurrentStep(0);
  };

  // Load a saved deal
  const loadDeal = (dealId: string) => {
    const dealToLoad = savedDeals.find(deal => deal.id === dealId);
    if (dealToLoad) {
      setDealData(dealToLoad);
      setSelectedStrategy(dealToLoad.strategy);
      // Go directly to the summary (final) step
      const steps = dealToLoad.strategy ? strategySteps[dealToLoad.strategy] : [];
      setCurrentStep(steps.length - 1);
    }
  };

  // Delete a deal
  const deleteDeal = (dealId: string) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      setSavedDeals(savedDeals.filter(deal => deal.id !== dealId));
      
      // If the current deal is being deleted, create a new one
      if (dealData.id === dealId) {
        createNewDeal();
      }
    }
  };

  // Render the current step content
  const renderStepContent = () => {
    if (!selectedStrategy) {
      return <StrategySelector onStrategySelect={setSelectedStrategy} />;
    }

    const steps = getStepsForStrategy();
    const currentStepId = steps[currentStep]?.id;

    // Common steps across all strategies
    switch (currentStepId) {
      case 'property':
        return (
          <PropertyInfo 
            dealData={dealData} 
            updateDealData={updateDealData} 
          />
        );
      case 'acquisition':
        return (
          <AcquisitionDetails 
            acquisition={dealData.config.acquisition} 
            updateAcquisition={(acquisition) => {
              // Create a new config object without causing a circular update
              const newConfig = { 
                ...dealData.config,
                acquisition
              };
              
              // Only update purchasePrice if it has changed to avoid circular updates
              if (newConfig.purchasePrice !== acquisition.purchasePrice) {
                newConfig.purchasePrice = acquisition.purchasePrice;
              }
              
              updateDealData({ config: newConfig });
            }} 
          />
        );
      case 'projection':
        return (
          <ProjectionSettings 
            projectionMonths={dealData.config.projectionMonths}
            updateProjectionMonths={(projectionMonths) => 
              updateDealData({ 
                config: { ...dealData.config, projectionMonths } 
              })
            }
            propertyValueChanges={dealData.config.propertyValueChanges || []}
            updatePropertyValueChanges={(propertyValueChanges) => 
              updateDealData({ 
                config: { ...dealData.config, propertyValueChanges } 
              })
            }
            rentChangeEvents={dealData.config.rentChangeEvents || []}
            updateRentChangeEvents={(rentChangeEvents) => 
              updateDealData({ 
                config: { ...dealData.config, rentChangeEvents } 
              })
            }
            expenseChangeEvents={dealData.config.expenseChangeEvents || []}
            updateExpenseChangeEvents={(expenseChangeEvents) => 
              updateDealData({ 
                config: { ...dealData.config, expenseChangeEvents } 
              })
            }
            initialMonthlyRent={dealData.config.operation.monthlyRent || 0}
            annualExpenseAppreciationRate={dealData.config.annualExpenseAppreciationRate || 0.02}
            updateExpenseAppreciationRate={(rate) => 
              updateDealData({ 
                config: { ...dealData.config, annualExpenseAppreciationRate: rate } 
              })
            }
          />
        );
      case 'summary':
        return (
          <DealSummary dealData={dealData} />
        );
    }

    // Strategy-specific steps
    if (selectedStrategy === 'brrrr') {
      switch (currentStepId) {
        case 'rehab':
          return (
            <RehabDetails 
              acquisition={dealData.config.acquisition}
              updateAcquisition={(acquisition) => 
                updateDealData({ 
                  config: { ...dealData.config, acquisition } 
                })
              }
              capitalExpenses={dealData.config.capitalExpenseEvents || []}
              updateCapitalExpenses={(capitalExpenseEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, capitalExpenseEvents } 
                })
              }
            />
          );
        case 'rental':
          return (
            <RentalDetails 
              operation={dealData.config.operation}
              updateOperation={(operation) => 
                updateDealData({ 
                  config: { ...dealData.config, operation } 
                })
              }
              rentChangeEvents={dealData.config.rentChangeEvents || []}
              updateRentChangeEvents={(rentChangeEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, rentChangeEvents } 
                })
              }
              expenseChangeEvents={dealData.config.expenseChangeEvents || []}
              updateExpenseChangeEvents={(expenseChangeEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, expenseChangeEvents } 
                })
              }
              capitalExpenses={dealData.config.capitalExpenseEvents || []}
              updateCapitalExpenses={(capitalExpenseEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, capitalExpenseEvents } 
                })
              }
            />
          );
        case 'refinance':
          return (
            <RefinanceDetails 
              refinanceEvents={dealData.config.refinanceEvents || []}
              updateRefinanceEvents={(refinanceEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, refinanceEvents } 
                })
              }
              acquisition={dealData.config.acquisition}
            />
          );
      }
    } 
    else if (selectedStrategy === 'longTermRental') {
      switch (currentStepId) {
        case 'rental':
          return (
            <RentalDetails 
              operation={dealData.config.operation}
              updateOperation={(operation) => 
                updateDealData({ 
                  config: { ...dealData.config, operation } 
                })
              }
              rentChangeEvents={dealData.config.rentChangeEvents || []}
              updateRentChangeEvents={(rentChangeEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, rentChangeEvents } 
                })
              }
              expenseChangeEvents={dealData.config.expenseChangeEvents || []}
              updateExpenseChangeEvents={(expenseChangeEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, expenseChangeEvents } 
                })
              }
              capitalExpenses={dealData.config.capitalExpenseEvents || []}
              updateCapitalExpenses={(capitalExpenseEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, capitalExpenseEvents } 
                })
              }
            />
          );
      }
    }
    else if (selectedStrategy === 'shortTermRental') {
      switch (currentStepId) {
        case 'str-income':
          return (
            <ShortTermRentalIncome
              strIncome={dealData.config.strIncome || defaultConfig.strIncome!}
              updateSTRIncome={(strIncome) => 
                updateDealData({ 
                  config: { ...dealData.config, strIncome } 
                })
              }
            />
          );
        case 'expenses':
          return (
            <STRExpenses
              strIncome={dealData.config.strIncome || defaultConfig.strIncome!}
              strExpenses={dealData.config.strExpenses || defaultConfig.strExpenses!}
              updateSTRExpenses={(strExpenses) => 
                updateDealData({ 
                  config: { ...dealData.config, strExpenses } 
                })
              }
            />
          );
      }
    }
    else if (selectedStrategy === 'multifamily') {
      switch (currentStepId) {
        case 'units':
          return (
            <MultiFamilyUnits
              units={dealData.config.units || []}
              updateUnits={(units) => 
                updateDealData({ 
                  config: { ...dealData.config, units } 
                })
              }
            />
          );
        case 'expenses':
          return (
            <RentalDetails 
              operation={dealData.config.operation}
              updateOperation={(operation) => 
                updateDealData({ 
                  config: { ...dealData.config, operation } 
                })
              }
              rentChangeEvents={dealData.config.rentChangeEvents || []}
              updateRentChangeEvents={(rentChangeEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, rentChangeEvents } 
                })
              }
              expenseChangeEvents={dealData.config.expenseChangeEvents || []}
              updateExpenseChangeEvents={(expenseChangeEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, expenseChangeEvents } 
                })
              }
              capitalExpenses={dealData.config.capitalExpenseEvents || []}
              updateCapitalExpenses={(capitalExpenseEvents) => 
                updateDealData({ 
                  config: { ...dealData.config, capitalExpenseEvents } 
                })
              }
            />
          );
      }
    }
    else if (selectedStrategy === 'houseHack') {
      switch (currentStepId) {
        case 'personal-unit':
        case 'rental-units':
        case 'expenses':
          return (
            <HouseHackDetails
              houseHack={{
                ...defaultConfig.houseHack!,
                ...dealData.config.houseHack,
                purchasePrice: dealData.config.acquisition.purchasePrice
              }}
              updateHouseHack={(houseHack) => 
                updateDealData({ 
                  config: { ...dealData.config, houseHack } 
                })
              }
            />
          );
      }
    }
    
    // Default fallback for any undefined steps
    return <div>This step is under development</div>;
  };

  // Don't show the timeline until a strategy is selected
  const steps = selectedStrategy ? getStepsForStrategy() : [];

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
      {/* Header section with title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">VeraYield Analyzer</h1>
        <p className="text-gray-600 mt-2">Create, analyze, and save your real estate investment deals</p>
      </div>
      
      {/* Deal selector and controls */}
      <div className="mb-8 flex flex-wrap justify-between gap-4 bg-gray-50 p-5 rounded-xl">
        <div className="flex flex-wrap gap-3">
          {/* Create New Deal button - only show if strategy is selected */}
          {selectedStrategy && (
            <button 
              onClick={createNewDeal}
              className="btn btn-success flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Deal
            </button>
          )}
          
          {/* Deal Library Button - Toggle saved deals view */}
          {savedDeals.length > 0 && (
            <button
              onClick={() => setShowSavedDeals(!showSavedDeals)}
              className="btn btn-secondary flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {showSavedDeals ? 'Hide Saved Deals' : 'View Saved Deals'}
            </button>
          )}
        </div>
        
        {selectedStrategy && (
          <div className="flex space-x-2">
            <button 
              onClick={saveDeal}
              className="btn btn-primary flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Deal
            </button>
            
            {/* PDF Export button - only show if on summary step */}
            {selectedStrategy && currentStep === (getStepsForStrategy().length - 1) && (
              <button 
                className="btn btn-secondary flex items-center"
                onClick={() => {
                  // Simply scrolls to the PDF export button in the DealSummary component
                  const exportButton = document.querySelector('[data-export-pdf]');
                  if (exportButton) {
                    exportButton.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Saved Deals Grid */}
      {showSavedDeals && savedDeals.length > 0 && (
        <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold text-navy mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Saved Deals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedDeals.map(deal => (
              <div 
                key={deal.id} 
                className="card card-hover p-5 cursor-pointer bg-white border-l-4 border-l-navy"
                onClick={() => loadDeal(deal.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">{deal.address || "Untitled Deal"}</h3>
                    <p className="text-xs text-navy/70 mt-1 font-medium">
                      Updated: {new Date(deal.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-navy text-white shadow-sm">
                    {getStrategyDisplayName(deal.strategy)}
                  </span>
                </div>
                
                {/* Quick stats if available */}
                <div className="mt-4 pt-3 border-t border-gray-100 text-sm grid grid-cols-2 gap-3">
                  {deal.config.purchasePrice ? (
                    <div className="flex flex-col">
                      <span className="text-navy/70 font-medium">Purchase Price</span> 
                      <span className="font-bold text-gray-900">${deal.config.purchasePrice.toLocaleString()}</span>
                    </div>
                  ) : null}
                  
                  {deal.config.operation?.monthlyRent ? (
                    <div className="flex flex-col">
                      <span className="text-navy/70 font-medium">Monthly Rent</span>
                      <span className="font-bold text-gray-900">${deal.config.operation.monthlyRent.toLocaleString()}</span>
                    </div>
                  ) : null}
                </div>
                
                <div className="mt-4 flex justify-between">
                  <div className="flex space-x-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        loadDeal(deal.id);
                      }}
                      className="btn btn-primary inline-flex items-center text-sm py-1.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Load the deal and advance to summary step
                        loadDeal(deal.id);
                        // Wait for deal to load, then click export button
                        setTimeout(() => {
                          const exportButton = document.querySelector('[data-export-pdf]');
                          if (exportButton) {
                            exportButton.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 500);
                      }}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded text-sm font-medium inline-flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF
                    </button>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDeal(deal.id);
                    }}
                    className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded text-sm font-medium inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current deal info */}
      {selectedStrategy && (
        <div className="mb-8 bg-gradient-to-r from-navy to-seaBlue p-6 rounded-xl text-white shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{dealData.address || "New Deal"}</h2>
              <p className="text-white/80 text-sm mt-1">Start building your investment analysis</p>
            </div>
            <div className="px-4 py-2 bg-white text-navy rounded-lg font-bold shadow-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {getStrategyDisplayName(dealData.strategy)}
            </div>
          </div>
        </div>
      )}

      {/* Timeline navigation */}
      {selectedStrategy && (
        <div className="bg-white p-6 rounded-xl mb-8 border border-gray-100 shadow-md">
          <h3 className="text-lg font-semibold text-navy mb-4">Deal Analysis Progress</h3>
          <Timeline 
            steps={steps} 
            currentStep={currentStep} 
            onStepClick={jumpToStep} 
          />
        </div>
      )}
      
      {/* Step content */}
      <div className="my-8 bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-xl font-bold text-navy mb-6 border-b border-gray-100 pb-3">
          {selectedStrategy ? steps[currentStep]?.label : "Choose Your Investment Strategy"}
        </h3>
        {renderStepContent()}
      </div>
      
      {/* Navigation buttons */}
      {selectedStrategy && (
        <div className="flex justify-between mt-8 pt-6 bg-gray-50 p-6 rounded-xl shadow-sm">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`py-2.5 px-6 rounded-md transition-all font-medium shadow-sm flex items-center ${
              currentStep === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'btn btn-primary hover:translate-x-[-2px]'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous Step
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className={`py-2.5 px-6 rounded-md transition-all font-medium shadow-sm flex items-center ${
              currentStep === steps.length - 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'btn btn-success hover:translate-x-[2px]'
            }`}
          >
            Next Step
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast, { Toaster } from 'react-hot-toast';
import StrategySelector from './StrategySelector';
import Timeline from './Timeline';
import PropertyInfo from './PropertyInfo';
import AcquisitionDetails from './AcquisitionDetails';
import RehabDetails from './RehabDetails';
import RentalDetails from './RentalDetails';
import RefinanceDetails from './RefinanceDetails';
import ProjectionSettings from './ProjectionSettings';
import DealSummary from './DealSummary';
import ShortTermRentalIncome from '../strategies/shortTermRentals/STRIncome';
import MultiFamilyUnits from '../strategies/multifamily/MultiFamilyUnits';
import HouseHackDetails from '../strategies/houseHack/HouseHackDetails';
import { Deal, DealTypes, defaultDealConfig, InvestmentStrategy, strategySteps } from '../models';
import STRExpenses from '../strategies/shortTermRentals/STRExpenses';

export default function DealAnalyzer() {
  // State for the selected investment strategy
  const [selectedStrategy, setSelectedStrategy] = useState<InvestmentStrategy | null>(null);
  
  // State for the current step in the process
  const [currentStep, setCurrentStep] = useState(0);
  
  // State for the deal data
  const [dealData, setDealData] = useState<Deal>({
    id: uuidv4(),
    name: '',
    address: '',
    strategy: DealTypes.LongTermRental,
    createdAt: new Date(),
    updatedAt: new Date(),
    config: defaultDealConfig,
  });

  // State for saved deals (would normally be in a database)
  const [savedDeals, setSavedDeals] = useState<Deal[]>([]);
  
  // State to control whether to show the saved deals grid (commented out as currently unused)
  // const [showSavedDeals, setShowSavedDeals] = useState(false);

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
  const updateDealData = (updates: Partial<Deal>) => {
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
      
      // Save to database via API
      try {
        const response = await fetch('/api/deals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedDeal)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to save deal to database:', errorData);
          // Still show success since we saved to localStorage
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        // Continue since we saved to localStorage
      }
      
      toast.success('Deal saved successfully!');
    } catch (error) {
      console.error('Error saving deal:', error);
      toast.error(`Error saving deal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Create a new deal
  const createNewDeal = () => {
    setSelectedStrategy(null);
    setCurrentStep(0);
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
              strIncome={dealData.config.strIncome || defaultDealConfig.strIncome!}
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
              strIncome={dealData.config.strIncome || defaultDealConfig.strIncome!}
              strExpenses={dealData.config.strExpenses || defaultDealConfig.strExpenses!}
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
                ...defaultDealConfig.houseHack!,
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
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
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
          
          {/* Removed "View Saved Deals" button */}
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
      
      {/* Saved Deals Grid removed */}

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
          
          {/* Only show Next Step button if not on the last step (summary) */}
          {currentStep < steps.length - 1 && (
            <button
              onClick={handleNext}
              className="py-2.5 px-6 rounded-md transition-all font-medium shadow-sm flex items-center btn btn-success hover:translate-x-[2px]"
            >
              Next Step
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
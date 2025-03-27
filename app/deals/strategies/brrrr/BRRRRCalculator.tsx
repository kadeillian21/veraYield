'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Timeline from '../../components/Timeline';
import PropertyInfo from '../../components/PropertyInfo';
import AcquisitionDetails from '../../components/AcquisitionDetails';
import RehabDetails from '../../components/RehabDetails';
import RentalDetails from '../../components/RentalDetails';
import RefinanceDetails from '../../components/RefinanceDetails';
import ProjectionSettings from '../../components/ProjectionSettings';
import DealSummary from '../../components/DealSummary';
import { ProjectionConfig } from '../../../utils/deals/projectionEngine';
import { Deal, DealTypes, defaultDealConfig, strategySteps } from '../../models';

export default function BRRRRCalculator() {
  // State for the current step in the process
  const [currentStep, setCurrentStep] = useState(0);
  
  // State for the deal data
  const [dealData, setDealData] = useState<Deal>({
    id: uuidv4(),
    name: 'New BRRRR Deal',
    address: '',
    strategy: DealTypes.BRRRR,
    createdAt: new Date(),
    updatedAt: new Date(),
    config: defaultDealConfig,
  });

  // State for saved deals (would normally be in a database)
  const [savedDeals, setSavedDeals] = useState<Deal[]>([]);

  // Load saved deals from localStorage on component mount
  useEffect(() => {
    const savedDealsJSON = localStorage.getItem('brrrDeals');
    if (savedDealsJSON) {
      try {
        const parsed = JSON.parse(savedDealsJSON);
        // Convert string dates back to Date objects
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsedWithDates = parsed.map((deal: any) => ({
          ...deal,
          createdAt: new Date(deal.createdAt),
          updatedAt: new Date(deal.updatedAt)
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
      // Convert Date objects to ISO strings before serializing to localStorage
      const dealsWithSerializedDates = savedDeals.map(deal => ({
        ...deal,
        createdAt: deal.createdAt instanceof Date ? deal.createdAt.toISOString() : deal.createdAt,
        updatedAt: deal.updatedAt instanceof Date ? deal.updatedAt.toISOString() : deal.updatedAt
      }));
      localStorage.setItem('brrrDeals', JSON.stringify(dealsWithSerializedDates));
    }
  }, [savedDeals]);

  // Handle moving to the next step
  const handleNext = () => {
    if (currentStep < strategySteps.brrrr.length - 1) {
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
    if (stepIndex >= 0 && stepIndex < strategySteps.brrrr.length) {
      setCurrentStep(stepIndex);
    }
  };

  // Update deal data
  const updateDealData = (updates: Partial<Deal>) => {
    setDealData(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date()
    }));
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
      
      alert('Deal saved successfully!');
    } catch (error) {
      console.error('Error saving deal:', error);
      alert(`Error saving deal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Create a new deal
  const createNewDeal = () => {
    setDealData({
      id: uuidv4(),
      name: 'New BRRRR Deal',
      address: '',
      strategy: DealTypes.BRRRR,
      createdAt: new Date(),
      updatedAt: new Date(),
      config: defaultDealConfig
    });
    setCurrentStep(0);
  };

  // Load a saved deal
  const loadDeal = (dealId: string) => {
    const dealToLoad = savedDeals.find(deal => deal.id === dealId);
    if (dealToLoad) {
      setDealData(dealToLoad);
      // Go to the summary step (last step) when loading a deal
      setCurrentStep(strategySteps.brrrr.length - 1);
    }
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (strategySteps.brrrr[currentStep].id) {
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
            updateAcquisition={(acquisition) => 
              updateDealData({ 
                config: { ...dealData.config, acquisition } 
              })
            } 
          />
        );
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
            initialMonthlyRent={dealData.config.operation.monthlyRent}
            annualExpenseAppreciationRate={dealData.config.annualExpenseAppreciationRate || 0.02}
            updateExpenseAppreciationRate={(annualExpenseAppreciationRate) => 
              updateDealData({ 
                config: { ...dealData.config, annualExpenseAppreciationRate } 
              })
            }
            refinanceEvents={dealData.config.refinanceEvents || []}
          />
        );
      case 'summary':
        return (
          <DealSummary dealData={dealData} />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
      {/* Deal selector and controls */}
      <div className="mb-8 flex flex-wrap justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={createNewDeal}
            className="bg-grass text-white py-2 px-4 rounded-md hover:bg-grass/90 transition-colors font-medium shadow-sm"
          >
            New Deal
          </button>
          
          {savedDeals.length > 0 && (
            <select 
              onChange={(e) => loadDeal(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-4 text-gray-900 focus:ring-navy focus:border-navy"
              value=""
            >
              <option value="" disabled>Load saved deal</option>
              {savedDeals.map(deal => (
                <option key={deal.id} value={deal.id}>
                  {deal.name} - {deal.address}
                </option>
              ))}
            </select>
          )}
        </div>
        
        <div>
          <button 
            onClick={saveDeal}
            className="bg-navy text-white py-2 px-4 rounded-md hover:bg-navy/90 transition-colors font-medium shadow-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Deal
          </button>
        </div>
      </div>

      {/* Current deal name and step */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">{dealData.name}</h2>
        {dealData.address && <p className="text-gray-900">{dealData.address}</p>}
      </div>

      {/* Timeline navigation */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8">
        <Timeline 
          steps={strategySteps.brrrr} 
          currentStep={currentStep} 
          onStepClick={jumpToStep} 
        />
      </div>
      
      {/* Step content */}
      <div className="my-8">
        {renderStepContent()}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-8 border-t border-gray-200 pt-6">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`py-2 px-6 rounded-md transition-colors font-medium shadow-sm flex items-center ${
            currentStep === 0 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-navy text-white hover:bg-navy/90'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        
        {/* Only show Next button if not on the last step (summary) */}
        {currentStep < strategySteps.brrrr.length - 1 && (
          <button
            onClick={handleNext}
            className="py-2 px-6 rounded-md transition-colors font-medium shadow-sm flex items-center bg-grass text-white hover:bg-grass/90"
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { DealData } from './components/dealAnalyzer/DealAnalyzer';
import toast, { Toaster } from 'react-hot-toast';

// Use dynamic import with no SSR to avoid hydration issues with client components
const DealAnalyzer = dynamic(
  () => import('./components/dealAnalyzer/DealAnalyzer'),
  { ssr: false }
);

export default function Home() {
  const [deals, setDeals] = useState<DealData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  // const router = useRouter(); // Commented out as currently unused
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent 
        deals={deals}
        setDeals={setDeals}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        showCreateDeal={showCreateDeal}
        setShowCreateDeal={setShowCreateDeal}
      />
    </Suspense>
  );
}

function HomeContent({
  deals,
  setDeals,
  isLoading,
  setIsLoading,
  showCreateDeal,
  setShowCreateDeal
}: {
  deals: DealData[];
  setDeals: React.Dispatch<React.SetStateAction<DealData[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  showCreateDeal: boolean;
  setShowCreateDeal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const searchParams = useSearchParams();
  const dealId = searchParams.get('dealId');

  useEffect(() => {
    // If a specific dealId is requested, show create deal view
    if (dealId) {
      setShowCreateDeal(true);
      return;
    }

    // Force show the create deal view initially (fix for showing toggle buttons)
    setShowCreateDeal(true);

    // Load deals from API and fall back to localStorage if needed
    const loadDeals = async () => {
      setIsLoading(true);

      try {
        // Try to fetch from API first
        const response = await fetch('/api/deals');
        
        if (response.ok) {
          const apiDeals = await response.json();
          
          // Transform the API deals to match our expected format
          const formattedApiDeals = apiDeals.map((deal: DealData) => ({
            ...deal,
            createdAt: new Date(deal.createdAt),
            updatedAt: new Date(deal.updatedAt),
          }));
          
          setDeals(formattedApiDeals);
          
          // We don't automatically switch to dashboard view now - leave the user on create deal view
        } else {
          // Fall back to localStorage if API fails
          console.warn('Could not fetch from API, falling back to localStorage');
          
          // Load from localStorage as backup
          const allDealsJSON = localStorage.getItem('investmentDeals');
          const allDeals = allDealsJSON ? JSON.parse(allDealsJSON) : [];

          const brrrDealsJSON = localStorage.getItem('brrrDeals');
          const brrrDeals = brrrDealsJSON ? JSON.parse(brrrDealsJSON) : [];

          // Combine all deals
          const combinedDeals = [...allDeals, ...brrrDeals]
            // Remove duplicates (same id)
            .filter((deal, index, self) => index === self.findIndex(d => d.id === deal.id))
            // Parse dates
            .map((deal: DealData) => ({
              ...deal,
              createdAt: new Date(deal.createdAt),
              updatedAt: new Date(deal.updatedAt),
            }));

          // Sort by updated date (newest first)
          combinedDeals.sort((a: DealData, b: DealData) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });

          setDeals(combinedDeals);
          
          // We keep the user on the create deal view by default
        }
      } catch (error) {
        console.error('Error loading deals:', error);
        
        // Attempt to load from localStorage as a fallback
        try {
          const allDealsJSON = localStorage.getItem('investmentDeals');
          const allDeals = allDealsJSON ? JSON.parse(allDealsJSON) : [];

          const brrrDealsJSON = localStorage.getItem('brrrDeals');
          const brrrDeals = brrrDealsJSON ? JSON.parse(brrrDealsJSON) : [];

          const combinedDeals = [...allDeals, ...brrrDeals]
            .filter((deal, index, self) => index === self.findIndex(d => d.id === deal.id))
            .map((deal: DealData) => ({
              ...deal,
              createdAt: new Date(deal.createdAt),
              updatedAt: new Date(deal.updatedAt),
            }))
            .sort((a: DealData, b: DealData) => {
              return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            });
            
          setDeals(combinedDeals);
          
          // We keep the user on create deal view by default
        } catch (localError) {
          console.error('Error loading deals from localStorage:', localError);
          setShowCreateDeal(true); // Show create deal view on error
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDeals();
  }, [dealId]);

  const deleteDeal = async (dealId: string) => {
    const deletePromise = async () => {
      try {
        // First, try to delete from the API
        const response = await fetch(`/api/deals?id=${dealId}`, {
          method: 'DELETE',
        });
        
        // Remove from state whether the API succeeds or not
        setDeals(deals.filter(deal => deal.id !== dealId));

        if (!response.ok) {
          console.warn('Failed to delete from API, falling back to localStorage only');
        }

        // Always remove from localStorage as backup
        const investmentDealsJSON = localStorage.getItem('investmentDeals');
        if (investmentDealsJSON) {
          const investmentDeals = JSON.parse(investmentDealsJSON);
          localStorage.setItem(
            'investmentDeals',
            JSON.stringify(investmentDeals.filter((deal: DealData) => deal.id !== dealId))
          );
        }

        const brrrDealsJSON = localStorage.getItem('brrrDeals');
        if (brrrDealsJSON) {
          const brrrDeals = JSON.parse(brrrDealsJSON);
          localStorage.setItem(
            'brrrDeals',
            JSON.stringify(brrrDeals.filter((deal: DealData) => deal.id !== dealId))
          );
        }
        return true;
      } catch (error) {
        console.error('Error deleting deal:', error);
        
        // Try to remove from localStorage as fallback
        try {
          const investmentDealsJSON = localStorage.getItem('investmentDeals');
          if (investmentDealsJSON) {
            const investmentDeals = JSON.parse(investmentDealsJSON);
            localStorage.setItem(
              'investmentDeals',
              JSON.stringify(investmentDeals.filter((deal: DealData) => deal.id !== dealId))
            );
          }

          const brrrDealsJSON = localStorage.getItem('brrrDeals');
          if (brrrDealsJSON) {
            const brrrDeals = JSON.parse(brrrDealsJSON);
            localStorage.setItem(
              'brrrDeals',
              JSON.stringify(brrrDeals.filter((deal: DealData) => deal.id !== dealId))
            );
          }
          
          // Update state
          setDeals(deals.filter(deal => deal.id !== dealId));
          return true;
        } catch (localError) {
          console.error('Error deleting from localStorage:', localError);
          throw new Error('Failed to delete deal');
        }
      }
    };
    
    toast.promise(
      deletePromise(),
      {
        loading: 'Deleting deal...',
        success: 'Deal deleted successfully!',
        error: 'Failed to delete deal',
      }
    );
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

  // Calculate metrics for display on the cards
  const getDealMetrics = (deal: DealData) => {
    // These are simplified calculations for display on cards
    // ROI (Return on Investment)
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
    
    return { roi, cashOnCash, monthlyRent, purchasePrice, monthlyCashFlow };
  };

  return (
    <div>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">VeraYield Investment Analyzer</h1>
        <p className="text-center mb-8 max-w-3xl mx-auto">
          Analyze different real estate investment strategies including long-term rentals, 
          BRRRR deals, short-term rentals, and more. Calculate returns, cash flow, and compare different approaches.
        </p>
        
        {/* Navigation Toggle Buttons */}
        {deals.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setShowCreateDeal(false)}
                className={`px-6 py-3 text-sm font-medium rounded-l-lg ${
                  !showCreateDeal 
                    ? 'bg-navy text-white'
                    : 'bg-white text-navy border border-navy hover:bg-navy/10'
                }`}
              >
                Deal Dashboard
              </button>
              <button
                type="button"
                onClick={() => setShowCreateDeal(true)}
                className={`px-6 py-3 text-sm font-medium rounded-r-lg ${
                  showCreateDeal 
                    ? 'bg-navy text-white'
                    : 'bg-white text-navy border border-navy hover:bg-navy/10'
                }`}
              >
                Create Deals
              </button>
            </div>
          </div>
        )}
        
        {/* Deal Dashboard */}
        {!showCreateDeal && (
          <div className="mb-8 space-y-6">
            {/* Dashboard Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-navy">My Investment Deals</h2>
            </div>
            
            {/* Deals List */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-navy"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {deals.map((deal) => {
                  const metrics = getDealMetrics(deal);
                  return (
                    <div key={deal.id} className="relative group">
                      <Link
                        href={`/deals/${deal.id}`}
                        className="block bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow card card-hover cursor-pointer"
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Property Info Section */}
                          <div className="bg-navy text-white p-5 md:w-1/4 flex flex-col justify-between">
                            <div>
                              <h2 className="text-xl font-bold mb-2 truncate">
                                {deal.name || deal.address || 'Untitled Deal'}
                              </h2>
                              <p className="text-white/80 mb-2 truncate">{deal.address}</p>
                              <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">
                                {getStrategyDisplayName(deal.strategy)}
                              </span>
                            </div>
                            <div className="text-xs text-white/75 mt-4">
                              Updated: {new Date(deal.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {/* Metrics Section */}
                          <div className="p-5 flex-grow grid grid-cols-1 md:grid-cols-5 gap-4">
                            {/* ROI */}
                            <div className="bg-gray-50 p-3 rounded-lg flex flex-col justify-center items-center">
                              <span className="text-xs text-gray-500 block mb-1">ROI</span>
                              <span className="font-semibold text-navy text-lg">
                                {metrics.roi.toFixed(2)}%
                              </span>
                            </div>
                            
                            {/* Cash on Cash Return */}
                            <div className="bg-gray-50 p-3 rounded-lg flex flex-col justify-center items-center">
                              <span className="text-xs text-gray-500 block mb-1">Cash on Cash</span>
                              <span className="font-semibold text-navy text-lg">
                                {metrics.cashOnCash.toFixed(2)}%
                              </span>
                            </div>

                            {/* Purchase Price */}
                            <div className="bg-gray-50 p-3 rounded-lg flex flex-col justify-center items-center">
                              <span className="text-xs text-gray-500 block mb-1">Purchase Price</span>
                              <span className="font-semibold text-gray-800">
                                ${metrics.purchasePrice.toLocaleString()}
                              </span>
                            </div>

                            {/* Monthly Rent */}
                            <div className="bg-gray-50 p-3 rounded-lg flex flex-col justify-center items-center">
                              <span className="text-xs text-gray-500 block mb-1">Monthly Rent</span>
                              <span className="font-semibold text-gray-800">
                                ${metrics.monthlyRent.toLocaleString()}
                              </span>
                            </div>
                            
                            {/* Monthly Cash Flow */}
                            <div className="bg-gray-50 p-3 rounded-lg flex flex-col justify-center items-center">
                              <span className="text-xs text-gray-500 block mb-1">Monthly Cash Flow</span>
                              <span className={`font-semibold text-lg ${metrics.monthlyCashFlow >= 0 ? 'text-grass' : 'text-red-500'}`}>
                                ${metrics.monthlyCashFlow.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                      
                      {/* Action buttons - positioned absolutely in top right corner */}
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <Link
                          href={`/compare?deals=${deal.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="bg-white/90 hover:bg-navy/10 text-navy p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          title="Compare Deal"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteDeal(deal.id);
                          }}
                          className="bg-white/90 hover:bg-red-50 text-red-600 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          title="Delete Deal"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* Create Deals View */}
        {(showCreateDeal || deals.length === 0) && <DealAnalyzer />}
      </div>
    </div>
  );
}
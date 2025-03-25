'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ComparisonSelector from '../components/dealComparison/ComparisonSelector';
import ComparisonTable from '../components/dealComparison/ComparisonTable';
import ComparisonChart from '../components/dealComparison/ComparisonChart';
import { DealData } from '../components/dealAnalyzer/DealAnalyzer';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

export default function ComparePage() {
  const [deals, setDeals] = useState<DealData[]>([]);
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'table' | 'chart'>('table');
  const router = useRouter();
  
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading...</div>}>
      <ComparPageContent />
    </Suspense>
  );
}

function ComparPageContent() {
  const [deals, setDeals] = useState<DealData[]>([]);
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'table' | 'chart'>('table');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Check if deals are preselected via URL parameters
    const dealIds = searchParams.get('deals');
    if (dealIds) {
      setSelectedDeals(dealIds.split(','));
    }
    
    // Load all deals
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
            .filter((deal: DealData, index: number, self: DealData[]) => 
              index === self.findIndex(d => d.id === deal.id)
            )
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
            .filter((deal: DealData, index: number, self: DealData[]) => 
              index === self.findIndex(d => d.id === deal.id)
            )
            .map((deal: DealData) => ({
              ...deal,
              createdAt: new Date(deal.createdAt),
              updatedAt: new Date(deal.updatedAt),
            }))
            .sort((a: DealData, b: DealData) => {
              return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            });
            
          setDeals(combinedDeals);
        } catch (localError) {
          console.error('Error loading deals from localStorage:', localError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDeals();
  }, [searchParams]);
  
  // Handle deal selection
  const handleDealSelect = (dealId: string) => {
    if (selectedDeals.length < 5) {
      const newSelectedDeals = [...selectedDeals, dealId];
      setSelectedDeals(newSelectedDeals);
      
      // Update URL parameter
      const url = new URL(window.location.href);
      url.searchParams.set('deals', newSelectedDeals.join(','));
      router.replace(url.pathname + url.search);
    }
  };
  
  // Handle deal removal
  const handleDealRemove = (dealId: string) => {
    const newSelectedDeals = selectedDeals.filter(id => id !== dealId);
    setSelectedDeals(newSelectedDeals);
    
    // Update URL parameter
    const url = new URL(window.location.href);
    if (newSelectedDeals.length > 0) {
      url.searchParams.set('deals', newSelectedDeals.join(','));
    } else {
      url.searchParams.delete('deals');
    }
    router.replace(url.pathname + url.search);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Compare Investment Deals</h1>
        <p className="text-center mb-8 max-w-3xl mx-auto">
          Select up to 5 deals from your portfolio to compare side by side. Quickly identify which 
          investments have the best cash flow, ROI, or other metrics to make informed decisions.
        </p>
        
        {/* Deal Selector */}
        <ComparisonSelector
          deals={deals}
          selectedDeals={selectedDeals}
          onDealSelect={handleDealSelect}
          onDealRemove={handleDealRemove}
          isLoading={isLoading}
        />
        
        {/* Tab Navigation - Only show if deals are selected */}
        {selectedDeals.length > 0 && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setActiveTab('table')}
                className={`px-6 py-3 text-sm font-medium rounded-l-lg ${
                  activeTab === 'table' 
                    ? 'bg-navy text-white'
                    : 'bg-white text-navy border border-navy hover:bg-navy/10'
                }`}
              >
                Table View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('chart')}
                className={`px-6 py-3 text-sm font-medium rounded-r-lg ${
                  activeTab === 'chart' 
                    ? 'bg-navy text-white'
                    : 'bg-white text-navy border border-navy hover:bg-navy/10'
                }`}
              >
                Chart View
              </button>
            </div>
          </div>
        )}
        
        {/* Comparison Content */}
        {activeTab === 'table' ? (
          <ComparisonTable 
            deals={deals}
            selectedDeals={selectedDeals}
          />
        ) : (
          <ComparisonChart 
            deals={deals}
            selectedDeals={selectedDeals}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}
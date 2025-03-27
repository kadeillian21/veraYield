'use client';

import React, { useEffect, useState } from 'react';
import DealSummary from '../components/DealSummary';
import { Deal } from '../models';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DealPage({
  params,
}: {
  params: { id: string };
}) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Properly unwrap params with React.use()
  const { id } = React.use(params);

  useEffect(() => {
    const loadDeal = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Try to fetch from API first
        const response = await fetch(`/api/deals?id=${id}`);
        
        if (response.ok) {
          const apiDeal = await response.json();
          
          if (apiDeal) {
            // Transform dates
            setDeal({
              ...apiDeal,
              createdAt: new Date(apiDeal.createdAt),
              updatedAt: new Date(apiDeal.updatedAt),
            });
          } else {
            setError('Deal not found');
          }
        } else {
          // Fall back to localStorage if API fails
          console.warn('Could not fetch from API, falling back to localStorage');
          
          // Try to find the deal in localStorage
          const allDealsJSON = localStorage.getItem('investmentDeals');
          const allDeals = allDealsJSON ? JSON.parse(allDealsJSON) : [];

          const brrrDealsJSON = localStorage.getItem('brrrDeals');
          const brrrDeals = brrrDealsJSON ? JSON.parse(brrrDealsJSON) : [];

          // Combine all deals
          const combinedDeals = [...allDeals, ...brrrDeals];
          
          // Find the specific deal
          const foundDeal = combinedDeals.find(deal => deal.id === id);
          
          if (foundDeal) {
            setDeal({
              ...foundDeal,
              createdAt: new Date(foundDeal.createdAt),
              updatedAt: new Date(foundDeal.updatedAt),
            });
          } else {
            setError('Deal not found');
          }
        }
      } catch (error) {
        console.error('Error loading deal:', error);
        setError('Failed to load deal data');
        
        // Attempt to load from localStorage as a fallback
        try {
          const allDealsJSON = localStorage.getItem('investmentDeals');
          const allDeals = allDealsJSON ? JSON.parse(allDealsJSON) : [];

          const brrrDealsJSON = localStorage.getItem('brrrDeals');
          const brrrDeals = brrrDealsJSON ? JSON.parse(brrrDealsJSON) : [];

          const combinedDeals = [...allDeals, ...brrrDeals];
          const foundDeal = combinedDeals.find(deal => deal.id === id);
          
          if (foundDeal) {
            setDeal({
              ...foundDeal,
              createdAt: new Date(foundDeal.createdAt),
              updatedAt: new Date(foundDeal.updatedAt),
            });
            setError(null);
          } else {
            setError('Deal not found');
          }
        } catch (localError) {
          console.error('Error loading deal from localStorage:', localError);
          setError('Failed to load deal data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadDeal();
    }
  }, [id]);

  const deleteDeal = async () => {
    if (!deal) return;
    
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        // First, try to delete from the API
        const response = await fetch(`/api/deals?id=${deal.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          console.warn('Failed to delete from API, falling back to localStorage only');
        }

        // Always remove from localStorage as backup
        const investmentDealsJSON = localStorage.getItem('investmentDeals');
        if (investmentDealsJSON) {
          const investmentDeals = JSON.parse(investmentDealsJSON);
          localStorage.setItem(
            'investmentDeals',
            JSON.stringify(investmentDeals.filter((d: Deal) => d.id !== deal.id))
          );
        }

        const brrrDealsJSON = localStorage.getItem('brrrDeals');
        if (brrrDealsJSON) {
          const brrrDeals = JSON.parse(brrrDealsJSON);
          localStorage.setItem(
            'brrrDeals',
            JSON.stringify(brrrDeals.filter((d: Deal) => d.id !== deal.id))
          );
        }
        
        // Navigate back to the homepage
        router.push('/');
      } catch (error) {
        console.error('Error deleting deal:', error);
        
        // Try to remove from localStorage as fallback
        try {
          const investmentDealsJSON = localStorage.getItem('investmentDeals');
          if (investmentDealsJSON) {
            const investmentDeals = JSON.parse(investmentDealsJSON);
            localStorage.setItem(
              'investmentDeals',
              JSON.stringify(investmentDeals.filter((d: Deal) => d.id !== deal.id))
            );
          }

          const brrrDealsJSON = localStorage.getItem('brrrDeals');
          if (brrrDealsJSON) {
            const brrrDeals = JSON.parse(brrrDealsJSON);
            localStorage.setItem(
              'brrrDeals',
              JSON.stringify(brrrDeals.filter((d: Deal) => d.id !== deal.id))
            );
          }
          
          // Navigate back to the homepage
          router.push('/');
        } catch (localError) {
          console.error('Error deleting from localStorage:', localError);
          alert('Failed to delete deal');
        }
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-navy"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
            <p className="text-gray-600 mb-6">The deal you&apos;re looking for might have been deleted or doesn&apos;t exist.</p>
            <Link
              href="/"
              className="bg-navy hover:bg-navy/90 text-white px-6 py-3 rounded-md font-medium inline-block"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : deal ? (
          <div className="space-y-6">
            {/* Header with action buttons */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">
                {deal.name || deal.address || 'Deal Summary'}
              </h1>
              
              <div className="flex space-x-4">
                <Link 
                  href={`/compare?deals=${deal.id}`}
                  className="bg-grass hover:bg-grass/90 text-white px-4 py-2 rounded-md font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Compare
                </Link>
                <Link 
                  href={`/?dealId=${deal.id}`}
                  className="bg-navy hover:bg-navy/90 text-white px-4 py-2 rounded-md font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Deal
                </Link>
                
                <button
                  onClick={deleteDeal}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Deal
                </button>
              </div>
            </div>
            
            {/* Deal info */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Property Address</h3>
                  <p className="text-gray-900 font-semibold">{deal.address || 'Not specified'}</p>
                </div>
                
                <div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Investment Strategy</h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-navy text-white">
                    {deal.strategy === 'brrrr' ? 'BRRRR' :
                     deal.strategy === 'longTermRental' ? 'Long-Term Rental' :
                     deal.strategy === 'shortTermRental' ? 'Short-Term Rental' :
                     deal.strategy === 'multifamily' ? 'Multi-Family' :
                     deal.strategy === 'houseHack' ? 'House Hack' :
                     deal.strategy}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Last Updated</h3>
                  <p className="text-gray-900 font-semibold">
                    {new Date(deal.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Deal Summary Component */}
            <DealSummary dealData={deal} />
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-4">No Deal Data</h2>
            <p className="text-gray-600 mb-6">There was a problem loading the deal information.</p>
            <Link
              href="/"
              className="bg-navy hover:bg-navy/90 text-white px-6 py-3 rounded-md font-medium inline-block"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
    </div>
  );
}
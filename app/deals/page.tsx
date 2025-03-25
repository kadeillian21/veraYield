'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DealData } from '../components/dealAnalyzer/DealAnalyzer';

export default function DealsPage() {
  const { status } = useSession();
  const [deals, setDeals] = useState<DealData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
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
        } catch (localError) {
          console.error('Error loading deals from localStorage:', localError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      loadDeals();
    }
  }, [status]);

  const deleteDeal = async (dealId: string) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
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
        } catch (localError) {
          console.error('Error deleting from localStorage:', localError);
          alert('Failed to delete deal');
        }
      }
    }
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Deals</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-navy hover:bg-navy/90 text-white px-4 py-2 rounded-md font-medium"
          >
            Create New Deal
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-navy"></div>
          </div>
        ) : deals.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">No Deals Found</h2>
            <p className="text-gray-600 mb-6">
              You haven&apos;t created any investment deals yet. Start analyzing your first property now!
            </p>
            <Link
              href="/"
              className="bg-navy hover:bg-navy/90 text-white px-6 py-3 rounded-md font-medium inline-block"
            >
              Create Your First Deal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="p-5 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-800 truncate">
                      {deal.name || 'Untitled Deal'}
                    </h2>
                    <span className="px-3 py-1 bg-navy/10 text-navy text-xs font-semibold rounded-full">
                      {getStrategyDisplayName(deal.strategy)}
                    </span>
                  </div>
                  <p className="text-gray-600 truncate">{deal.address}</p>
                </div>

                <div className="px-5 py-3 bg-gray-50">
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-1 text-gray-700">
                        {new Date(deal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Updated:</span>
                      <span className="ml-1 text-gray-700">
                        {new Date(deal.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-5">
                  {deal.config.acquisition?.purchasePrice ? (
                    <div>
                      <span className="text-xs text-gray-500 block">Purchase Price</span>
                      <span className="font-semibold text-gray-800">
                        ${deal.config.acquisition.purchasePrice.toLocaleString()}
                      </span>
                    </div>
                  ) : null}

                  {deal.config.operation?.monthlyRent ? (
                    <div>
                      <span className="text-xs text-gray-500 block">Monthly Rent</span>
                      <span className="font-semibold text-gray-800">
                        ${deal.config.operation.monthlyRent.toLocaleString()}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="flex border-t border-gray-200">
                  <Link
                    href={`/?dealId=${deal.id}`}
                    className="flex-1 py-3 text-center font-medium text-navy hover:bg-navy/5 transition-colors border-r border-gray-200"
                  >
                    View & Edit
                  </Link>
                  <button
                    onClick={() => deleteDeal(deal.id)}
                    className="flex-1 py-3 text-center font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

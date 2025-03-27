'use client';

import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import Header from '../components/Navbar';
import Footer from '../components/Footer';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  annualSavings?: number | null;
  stateOfResidence?: string | null;
  investorType?: string | null;
  investmentGoals?: string[];
  preferredMarkets?: string[];
}

interface ExtendedSession {
  user?: ExtendedUser;
  expires: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState<ExtendedUser | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (session?.user) {
      // Fetch complete user profile from API
      fetch(`/api/users/profile`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setProfileData(data.user);
          }
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
          // Fall back to session data
          setProfileData(session?.user as ExtendedUser);
        });
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (profileData) {
      if (type === 'number') {
        setProfileData({
          ...profileData,
          [name]: value ? parseFloat(value) : null,
        });
      } else {
        setProfileData({
          ...profileData,
          [name]: value,
        });
      }
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    if (profileData) {
      if (e.target.name === 'investmentGoals') {
        const currentGoals = profileData.investmentGoals || [];
        if (checked) {
          setProfileData({
            ...profileData,
            investmentGoals: [...currentGoals, value],
          });
        } else {
          setProfileData({
            ...profileData,
            investmentGoals: currentGoals.filter(goal => goal !== value),
          });
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setEditing(false);
      
      // Update session
      await update({
        ...session,
        user: profileData,
      });
      
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-navy"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    // This should be handled by the middleware, but just in case
    router.push('/auth/signin');
    return null;
  }

  const investorTypes = [
    { value: 'beginner', label: 'Beginner (0-1 properties)' },
    { value: 'intermediate', label: 'Intermediate (2-5 properties)' },
    { value: 'advanced', label: 'Advanced (6+ properties)' },
  ];

  const investmentGoalOptions = [
    { value: 'cashFlow', label: 'Monthly Cash Flow' },
    { value: 'appreciation', label: 'Long-term Appreciation' },
    { value: 'taxBenefits', label: 'Tax Benefits' },
    { value: 'portfolioGrowth', label: 'Portfolio Growth' },
    { value: 'passiveIncome', label: 'Passive Income' },
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-navy to-seaBlue p-8 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
                <p className="text-white/80">Manage your account and investment preferences</p>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md"
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="p-8">
            {message.text && (
              <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <div className="flex items-center space-x-6 mb-8">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session?.user?.name || 'User avatar'}
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-navy h-24 w-24"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-navy text-white flex items-center justify-center text-xl font-bold">
                  {session?.user?.name?.[0] || 'U'}
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold text-gray-800">{profileData?.name || session?.user?.name || 'User'}</h2>
                <p className="text-gray-600">{profileData?.email || session?.user?.email || ''}</p>
                {profileData?.stateOfResidence && (
                  <p className="text-gray-600">Location: {profileData.stateOfResidence}</p>
                )}
              </div>
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileData?.name || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData?.email || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md bg-gray-100"
                      disabled
                    />
                  </div>

                  <div>
                    <label htmlFor="annualSavings" className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Savings ($)
                    </label>
                    <input
                      type="number"
                      id="annualSavings"
                      name="annualSavings"
                      value={profileData?.annualSavings || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="How much can you save per year?"
                    />
                  </div>

                  <div>
                    <label htmlFor="stateOfResidence" className="block text-sm font-medium text-gray-700 mb-1">
                      State of Residence
                    </label>
                    <select
                      id="stateOfResidence"
                      name="stateOfResidence"
                      value={profileData?.stateOfResidence || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select a state</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="investorType" className="block text-sm font-medium text-gray-700 mb-1">
                      Investor Experience
                    </label>
                    <select
                      id="investorType"
                      name="investorType"
                      value={profileData?.investorType || 'beginner'}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {investorTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Goals (select all that apply)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {investmentGoalOptions.map(goal => (
                      <div key={goal.value} className="flex items-center">
                        <input
                          type="checkbox"
                          id={goal.value}
                          name="investmentGoals"
                          value={goal.value}
                          checked={profileData?.investmentGoals?.includes(goal.value) || false}
                          onChange={handleCheckboxChange}
                          className="mr-2"
                        />
                        <label htmlFor={goal.value}>{goal.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-navy text-white rounded-md hover:bg-navy/90 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-navy">Account Information</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm text-gray-500">Email</dt>
                        <dd className="font-medium text-gray-800">{profileData?.email || session?.user?.email || ''}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Name</dt>
                        <dd className="font-medium text-gray-800">{profileData?.name || session?.user?.name || ''}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Account Type</dt>
                        <dd className="font-medium text-gray-800">
                          {session?.user?.image ? 'Google Account' : 'Email'}
                        </dd>
                      </div>
                      {profileData?.annualSavings && (
                        <div>
                          <dt className="text-sm text-gray-500">Annual Savings</dt>
                          <dd className="font-medium text-gray-800">${profileData.annualSavings.toLocaleString()}</dd>
                        </div>
                      )}
                      {profileData?.stateOfResidence && (
                        <div>
                          <dt className="text-sm text-gray-500">State</dt>
                          <dd className="font-medium text-gray-800">{profileData.stateOfResidence}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-navy">Investment Profile</h3>
                    <dl className="space-y-3">
                      {profileData?.investorType && (
                        <div>
                          <dt className="text-sm text-gray-500">Experience Level</dt>
                          <dd className="font-medium text-gray-800">
                            {investorTypes.find(t => t.value === profileData.investorType)?.label || profileData.investorType}
                          </dd>
                        </div>
                      )}
                      {profileData?.investmentGoals && profileData.investmentGoals.length > 0 && (
                        <div>
                          <dt className="text-sm text-gray-500">Investment Goals</dt>
                          <dd className="font-medium text-gray-800">
                            <ul className="list-disc pl-5 space-y-1 mt-1">
                              {profileData.investmentGoals.map(goal => (
                                <li key={goal}>
                                  {investmentGoalOptions.find(g => g.value === goal)?.label || goal}
                                </li>
                              ))}
                            </ul>
                          </dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-sm text-gray-500">Total Deals</dt>
                        <dd className="font-medium text-gray-800">
                          <Link
                            href="/deals"
                            className="text-blue-600 hover:underline"
                          >
                            View All Deals
                          </Link>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

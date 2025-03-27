'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    annualSavings: '',
    stateOfResidence: '',
    investorType: 'beginner',
    investmentGoals: [] as string[],
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      if (checked) {
        return { ...prev, investmentGoals: [...prev.investmentGoals, value] };
      } else {
        return { ...prev, investmentGoals: prev.investmentGoals.filter(goal => goal !== value) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          annualSavings: formData.annualSavings ? parseFloat(formData.annualSavings) : undefined,
          stateOfResidence: formData.stateOfResidence,
          investorType: formData.investorType,
          investmentGoals: formData.investmentGoals,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      // Auto sign in after successful signup
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
            minLength={8}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="annualSavings">
            Annual Savings ($)
          </label>
          <input
            type="number"
            id="annualSavings"
            name="annualSavings"
            value={formData.annualSavings}
            onChange={handleChange}
            placeholder="How much can you save per year?"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="stateOfResidence">
            State of Residence
          </label>
          <select
            id="stateOfResidence"
            name="stateOfResidence"
            value={formData.stateOfResidence}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select a state</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="investorType">
            Investor Experience
          </label>
          <select
            id="investorType"
            name="investorType"
            value={formData.investorType}
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

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Investment Goals (select all that apply)
          </label>
          <div className="space-y-2">
            {investmentGoalOptions.map(goal => (
              <div key={goal.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={goal.value}
                  name="investmentGoals"
                  value={goal.value}
                  checked={formData.investmentGoals.includes(goal.value)}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <label htmlFor={goal.value}>{goal.label}</label>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p>
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
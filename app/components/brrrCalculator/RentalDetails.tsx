'use client';

import React, { useState } from 'react';
import { 
  PropertyOperation, 
  RentChangeEvent,
  ExpenseChangeEvent,
  CapitalExpenseEvent
} from '../../utils/brrrCalculator/projectionEngine';
import CurrencyInput from './ui/CurrencyInput';
import PercentageInput from './ui/PercentageInput';
import NumberInput from './ui/NumberInput';

interface RentalDetailsProps {
  operation: PropertyOperation;
  updateOperation: (operation: PropertyOperation) => void;
  rentChangeEvents: RentChangeEvent[];
  updateRentChangeEvents: (events: RentChangeEvent[]) => void;
  expenseChangeEvents: ExpenseChangeEvent[];
  updateExpenseChangeEvents: (events: ExpenseChangeEvent[]) => void;
  capitalExpenses: CapitalExpenseEvent[];
  updateCapitalExpenses: (capitalExpenses: CapitalExpenseEvent[]) => void;
}

export default function RentalDetails({
  operation,
  updateOperation,
  rentChangeEvents,
  capitalExpenses,
  updateCapitalExpenses
}: RentalDetailsProps) {  
  // State for new capital expense component
  const [newExpense, setNewExpense] = useState<{
    component: string;
    lifespan: number;
    replacementCost: number;
    lastReplaced: number;
  }>({
    component: '',
    lifespan: 0,
    replacementCost: 0,
    lastReplaced: 0
  });

  // Helper to update a specific field
  const updateField = (field: keyof PropertyOperation, value: number) => {
    updateOperation({
      ...operation,
      [field]: value
    });
  };
  
  // Calculate monthly budget amount for capital expenses
  const calculateMonthlyBudget = (cost: number, lifespan: number): number => {
    if (lifespan <= 0) return 0;
    return cost / (lifespan * 12); // Monthly amount to save
  };

  // Add a new capital expense component
  const addCapitalExpense = () => {
    if (newExpense.component && newExpense.replacementCost > 0 && newExpense.lifespan > 0) {
      const monthlyBudget = calculateMonthlyBudget(
        newExpense.replacementCost, 
        newExpense.lifespan
      );
      
      const updatedExpenses = [
        ...capitalExpenses,
        {
          component: newExpense.component,
          lifespan: newExpense.lifespan,
          replacementCost: newExpense.replacementCost,
          lastReplaced: newExpense.lastReplaced,
          monthlyBudget: monthlyBudget
        }
      ];
      
      // Sort by component name for easier reference
      updatedExpenses.sort((a, b) => a.component.localeCompare(b.component));
      
      updateCapitalExpenses(updatedExpenses);
      
      // Reset form with empty defaults
      setNewExpense({
        component: '',
        lifespan: 0,
        replacementCost: 0,
        lastReplaced: 0
      });
    }
  };

  // Remove a capital expense
  const removeCapitalExpense = (index: number) => {
    const updatedExpenses = [...capitalExpenses];
    updatedExpenses.splice(index, 1);
    updateCapitalExpenses(updatedExpenses);
  };

  // Calculate monthly totals
  const monthlyIncome = operation.monthlyRent + operation.otherMonthlyIncome;
  
  // Calculate property tax and insurance monthly amounts
  const monthlyPropertyTaxes = operation.propertyTaxes / 12;
  const monthlyInsurance = operation.insurance / 12;
  
  // Calculate percentage-based expenses
  const monthlyPropertyMgmt = operation.monthlyRent * operation.propertyManagement / 100;
  const monthlyVacancy = operation.monthlyRent * operation.vacancyRate / 100;
  
  // Calculate total monthly expenses
  const monthlyExpenses = 
    monthlyPropertyTaxes +
    monthlyInsurance +
    operation.maintenance +
    monthlyPropertyMgmt +
    operation.utilities +
    monthlyVacancy +
    operation.otherExpenses;
  
  const monthlyCashFlow = monthlyIncome - monthlyExpenses;
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Rental Details</h3>
      
      {/* Income */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Rental Income</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Rent
            </label>
            <CurrencyInput
              value={operation.monthlyRent}
              onChange={(value) => updateField('monthlyRent', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Monthly Income
            </label>
            <CurrencyInput
              value={operation.otherMonthlyIncome}
              onChange={(value) => updateField('otherMonthlyIncome', value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Laundry, storage, parking, etc.
            </p>
          </div>
        </div>
      </div>
      
      {/* Expenses */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-800">Operating Expenses</h4>
        
        <p className="text-sm text-gray-600 mb-4">
          Property taxes and insurance are entered as annual amounts (as typically billed), but their monthly impact is shown below each input. All other expenses are entered as monthly amounts.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Property Taxes
            </label>
            <CurrencyInput
              value={operation.propertyTaxes}
              onChange={(value) => updateField('propertyTaxes', value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              ${Math.round(operation.propertyTaxes / 12).toLocaleString()}/month
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Insurance
            </label>
            <CurrencyInput
              value={operation.insurance}
              onChange={(value) => updateField('insurance', value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              ${Math.round(operation.insurance / 12).toLocaleString()}/month
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Maintenance
            </label>
            <CurrencyInput
              value={operation.maintenance}
              onChange={(value) => updateField('maintenance', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Management (% of rent)
            </label>
            <PercentageInput
              value={operation.propertyManagement / 100}
              onChange={(value) => updateField('propertyManagement', value * 100)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Utilities
            </label>
            <CurrencyInput
              value={operation.utilities}
              onChange={(value) => updateField('utilities', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vacancy Rate (% of rent)
            </label>
            <PercentageInput
              value={operation.vacancyRate / 100}
              onChange={(value) => updateField('vacancyRate', value * 100)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Monthly Expenses
            </label>
            <CurrencyInput
              value={operation.otherExpenses}
              onChange={(value) => updateField('otherExpenses', value)}
            />
          </div>
        </div>
      </div>
      
      {/* Future projection note */}
      <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 space-y-4">
        <h4 className="text-lg font-medium text-blue-900">Future Changes</h4>
        <p className="text-sm text-blue-800">
          Once you&apos;ve set your initial rental details, you can model future rent increases and expense changes in the Projection Settings screen.
        </p>
        <p className="text-sm text-blue-800">
          In the Projection Settings, you&apos;ll be able to:
        </p>
        <ul className="list-disc list-inside text-blue-800 space-y-1 ml-4">
          <li>Add percentage-based or exact value rent increases over time</li>
          <li>Schedule expense changes for any expense category</li>
          <li>Model property value changes for appreciation</li>
          <li>Set your desired projection timeframe</li>
        </ul>
        {rentChangeEvents.length > 0 && (
          <div className="mt-4 bg-white p-4 rounded-lg border border-blue-200">
            <h5 className="font-medium text-blue-900 mb-2">Existing Changes</h5>
            <p className="text-sm text-blue-800">
              You have {rentChangeEvents.length} rent changes scheduled.
              These can be viewed and modified in the Projection Settings screen.
            </p>
          </div>
        )}
      </div>
      
      {/* Capital Expense Components */}
      <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100 space-y-4">
        <h4 className="text-lg font-medium text-green-900 mb-2">Capital Expense Components</h4>
        <p className="text-sm text-green-800 mb-4">
          Add property components that will need replacement over time. This helps you budget for future capital expenses and properly account for them in your analysis.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg border border-green-200">
          <div>
            <label className="brrrr-label">
              Component
            </label>
            <input
              type="text"
              value={newExpense.component}
              onChange={(e) => setNewExpense({
                ...newExpense,
                component: e.target.value
              })}
              className="brrrr-input"
              placeholder="e.g., Roof, HVAC, Water Heater"
            />
          </div>
          
          <div>
            <label className="brrrr-label">
              Lifespan (years)
            </label>
            <NumberInput
              min={1}
              max={50}
              value={newExpense.lifespan}
              onChange={(value) => setNewExpense({
                ...newExpense,
                lifespan: value
              })}
              className="brrrr-input"
              placeholder="15"
            />
            <p className="text-xs text-gray-900 mt-1">Typical range: 5-30 years</p>
          </div>
          
          <div>
            <label className="brrrr-label">
              Replacement Cost
            </label>
            <CurrencyInput
              value={newExpense.replacementCost}
              onChange={(value) => setNewExpense({
                ...newExpense,
                replacementCost: value
              })}
              placeholder="10000"
            />
          </div>
          
          <div>
            <label className="brrrr-label">
              Age (years)
            </label>
            <NumberInput
              min={0}
              max={newExpense.lifespan}
              value={newExpense.lastReplaced}
              onChange={(value) => setNewExpense({
                ...newExpense,
                lastReplaced: value
              })}
              className="brrrr-input"
              placeholder="0"
            />
            <p className="text-xs text-gray-900 mt-1">Current age of component</p>
          </div>
        </div>
        
        <div className="mt-2 flex justify-between items-center">
          <div className="text-green-900 text-sm">
            <span className="font-medium">Monthly budget amount:</span> ${newExpense.replacementCost > 0 && newExpense.lifespan > 0 ? (newExpense.replacementCost / (newExpense.lifespan * 12)).toFixed(2) : '0.00'}/month
          </div>
          
          <button
            type="button"
            onClick={addCapitalExpense}
            disabled={!newExpense.component || newExpense.replacementCost <= 0}
            className={`py-2 px-4 rounded-md transition-colors ${
              !newExpense.component || newExpense.replacementCost <= 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-700 text-white hover:bg-green-800'
            }`}
          >
            Add Component
          </button>
        </div>
        
        {/* Component suggestions */}
        <div className="bg-green-100 p-3 rounded-md text-sm text-green-800">
          <p className="font-medium">Common Components & Typical Lifespans:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1 mt-1">
            <div>• Roof: 20-25 years</div>
            <div>• HVAC: 15-20 years</div>
            <div>• Water Heater: 10-15 years</div>
            <div>• Kitchen Appliances: 10-15 years</div>
            <div>• Exterior Paint: 7-10 years</div>
            <div>• Flooring: 15-25 years</div>
          </div>
        </div>
        
        {/* List of capital expense components */}
        {capitalExpenses.length > 0 && (
          <div className="mt-4">
            <h5 className="brrrr-section-heading text-md mb-2">Your Capital Expense Components</h5>
            
            <div className="overflow-auto max-h-60">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium brrrr-table-header uppercase tracking-wider">
                      Component
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium brrrr-table-header uppercase tracking-wider">
                      Lifespan
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium brrrr-table-header uppercase tracking-wider">
                      Replacement Cost
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium brrrr-table-header uppercase tracking-wider">
                      Monthly Budget
                    </th>
                    <th className="px-4 py-2 text-xs font-medium brrrr-table-header uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {capitalExpenses.map((expense, index) => (
                    <tr key={index} className="brrrr-table-cell">
                      <td className="px-4 py-2 whitespace-nowrap">
                        {expense.component}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {expense.lifespan} years
                        {expense.lastReplaced && expense.lastReplaced > 0 && ` (${expense.lastReplaced} years old)`}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        ${expense.replacementCost.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        ${expense.monthlyBudget ? expense.monthlyBudget.toFixed(2) : '0.00'}/month
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => removeCapitalExpense(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-3 text-green-900 font-medium">
              Total Monthly Capital Expense Budget: ${capitalExpenses.reduce((sum, expense) => sum + (expense.monthlyBudget || 0), 0).toFixed(2)}
            </div>
          </div>
        )}
      </div>
      
      {/* Cash Flow Summary */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-green-800 mb-4">Monthly Cash Flow</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-4">
          <div>
            <p className="text-sm text-green-700 font-medium">Monthly Income</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-green-800">Rent</span>
                <span className="text-green-900 font-medium">${operation.monthlyRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-800">Other Income</span>
                <span className="text-green-900 font-medium">${operation.otherMonthlyIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-green-200">
                <span className="text-green-800 font-medium">Total Monthly Income</span>
                <span className="text-green-900 font-bold">${monthlyIncome.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-green-700 font-medium">Monthly Expenses</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-green-800">Property Taxes</span>
                <span className="text-green-900 font-medium">${monthlyPropertyTaxes.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-800">Insurance</span>
                <span className="text-green-900 font-medium">${monthlyInsurance.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-800">Maintenance</span>
                <span className="text-green-900 font-medium">${operation.maintenance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-800">Property Management</span>
                <span className="text-green-900 font-medium">${monthlyPropertyMgmt.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-800">Utilities</span>
                <span className="text-green-900 font-medium">${operation.utilities.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-800">Vacancy</span>
                <span className="text-green-900 font-medium">${monthlyVacancy.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-800">Other Expenses</span>
                <span className="text-green-900 font-medium">${operation.otherExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-green-200">
                <span className="text-green-800 font-medium">Total Expenses</span>
                <span className="text-green-900 font-bold">${monthlyExpenses.toFixed(0)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <p className="text-sm text-green-700 font-medium">Monthly Cash Flow</p>
            <p className="text-2xl font-bold my-2 text-black">
              ${monthlyCashFlow.toFixed(0)}
            </p>
            <p className="text-sm text-green-800">
              Annual Cash Flow: ${(monthlyCashFlow * 12).toFixed(0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
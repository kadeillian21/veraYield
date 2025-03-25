'use client';

import React, { useState } from 'react';
import CurrencyInput from '../brrrCalculator/ui/CurrencyInput';
import PercentageInput from '../brrrCalculator/ui/PercentageInput';
import NumberInput from '../brrrCalculator/ui/NumberInput';

export interface RentalUnit {
  id: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  monthlyRent: number;
  occupancyRate: number; // stored as percentage (e.g., 95)
}

interface MultiFamilyUnitsProps {
  units: RentalUnit[];
  updateUnits: (units: RentalUnit[]) => void;
}

export default function MultiFamilyUnits({ 
  units, 
  updateUnits 
}: MultiFamilyUnitsProps) {
  // New unit form
  const [newUnit, setNewUnit] = useState<Omit<RentalUnit, 'id'>>({
    unitNumber: '',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 0,
    monthlyRent: 0,
    occupancyRate: 95
  });

  // Unit template options for quick unit creation
  const unitTemplates = [
    { name: "Studio", bedrooms: 0, bathrooms: 1, sqft: 500 },
    { name: "1 Bed / 1 Bath", bedrooms: 1, bathrooms: 1, sqft: 650 },
    { name: "2 Bed / 1 Bath", bedrooms: 2, bathrooms: 1, sqft: 850 },
    { name: "2 Bed / 2 Bath", bedrooms: 2, bathrooms: 2, sqft: 950 },
    { name: "3 Bed / 2 Bath", bedrooms: 3, bathrooms: 2, sqft: 1200 }
  ];
  
  // Generate ID using randomness and timestamp
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  // Add a new unit
  const addUnit = () => {
    if (!newUnit.unitNumber || newUnit.monthlyRent <= 0) return;
    
    const updatedUnits = [
      ...units,
      {
        ...newUnit,
        id: generateId()
      }
    ];
    
    // Sort by unit number
    updatedUnits.sort((a, b) => a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true }));
    
    updateUnits(updatedUnits);
    
    // Reset form but keep the bedrooms/bathrooms as they likely add similar units
    setNewUnit({
      unitNumber: String(Number(newUnit.unitNumber) + 1), // Increment unit number
      bedrooms: newUnit.bedrooms,
      bathrooms: newUnit.bathrooms,
      sqft: newUnit.sqft,
      monthlyRent: newUnit.monthlyRent,
      occupancyRate: newUnit.occupancyRate
    });
  };

  // Update a unit field
  const updateUnit = (id: string, field: keyof RentalUnit, value: number | string) => {
    const updatedUnits = units.map(unit => {
      if (unit.id === id) {
        return {
          ...unit,
          [field]: value
        };
      }
      return unit;
    });
    
    updateUnits(updatedUnits);
  };

  // Remove a unit
  const removeUnit = (id: string) => {
    const updatedUnits = units.filter(unit => unit.id !== id);
    updateUnits(updatedUnits);
  };

  // Apply unit template
  const applyTemplate = (template: typeof unitTemplates[0]) => {
    setNewUnit({
      ...newUnit,
      bedrooms: template.bedrooms,
      bathrooms: template.bathrooms,
      sqft: template.sqft
    });
  };

  // Duplicate a unit (useful for similar units)
  const duplicateUnit = (unit: RentalUnit) => {
    // Generate next unit number increment
    const unitNums = units.map(u => u.unitNumber).filter(n => !isNaN(Number(n)));
    const maxUnitNum = unitNums.length > 0 
      ? Math.max(...unitNums.map(n => Number(n))) 
      : 0;
    
    const nextUnitNum = String(maxUnitNum + 1);
    
    const newUnitCopy = {
      ...unit,
      id: generateId(),
      unitNumber: nextUnitNum
    };
    
    const updatedUnits = [...units, newUnitCopy];
    
    // Sort by unit number
    updatedUnits.sort((a, b) => a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true }));
    
    updateUnits(updatedUnits);
  };

  // Calculate totals and statistics
  const calculateStats = () => {
    if (units.length === 0) {
      return {
        totalRent: 0,
        averageRent: 0,
        averageRentPerSqft: 0,
        totalSqft: 0,
        totalUnits: 0,
        totalBedrooms: 0,
        totalBathrooms: 0,
        effectiveGrossIncome: 0
      };
    }
    
    const totalRent = units.reduce((sum, unit) => sum + unit.monthlyRent, 0);
    const totalSqft = units.reduce((sum, unit) => sum + unit.sqft, 0);
    const totalBedrooms = units.reduce((sum, unit) => sum + unit.bedrooms, 0);
    const totalBathrooms = units.reduce((sum, unit) => sum + unit.bathrooms, 0);
    
    // Calculate effective gross income (accounting for vacancy)
    const effectiveGrossIncome = units.reduce((sum, unit) => 
      sum + (unit.monthlyRent * (unit.occupancyRate / 100)), 0);
    
    return {
      totalRent,
      averageRent: totalRent / units.length,
      averageRentPerSqft: totalRent / totalSqft,
      totalSqft,
      totalUnits: units.length,
      totalBedrooms,
      totalBathrooms,
      effectiveGrossIncome
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Multi-Family Units</h3>
      
      {/* Unit Quick Add Templates */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Unit Quick Add</h4>
        <p className="text-sm text-gray-600 mb-4">
          Select a unit type to pre-fill the new unit form below.
        </p>
        
        <div className="flex flex-wrap gap-2">
          {unitTemplates.map((template, index) => (
            <button
              key={index}
              type="button"
              onClick={() => applyTemplate(template)}
              className="bg-navy text-white py-2 px-4 rounded-md hover:bg-navy/90 transition-colors"
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Add New Unit Form */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Add New Unit</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit #
            </label>
            <input
              type="text"
              value={newUnit.unitNumber}
              onChange={(e) => setNewUnit({ ...newUnit, unitNumber: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="101"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beds
            </label>
            <NumberInput
              value={newUnit.bedrooms}
              min={0}
              max={10}
              onChange={(value) => setNewUnit({ ...newUnit, bedrooms: value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Baths
            </label>
            <NumberInput
              value={newUnit.bathrooms}
              min={0.5}
              max={10}
              onChange={(value) => setNewUnit({ ...newUnit, bathrooms: value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sq. Ft.
            </label>
            <NumberInput
              value={newUnit.sqft}
              min={0}
              max={10000}
              onChange={(value) => setNewUnit({ ...newUnit, sqft: value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Rent
            </label>
            <CurrencyInput
              value={newUnit.monthlyRent}
              onChange={(value) => setNewUnit({ ...newUnit, monthlyRent: value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupancy Rate
            </label>
            <PercentageInput
              value={newUnit.occupancyRate / 100}
              onChange={(value) => setNewUnit({ ...newUnit, occupancyRate: value * 100 })}
            />
          </div>
        </div>
        
        <div className="mt-4">
          <button
            type="button"
            onClick={addUnit}
            disabled={!newUnit.unitNumber || newUnit.monthlyRent <= 0}
            className={`py-2 px-4 rounded-md ${
              !newUnit.unitNumber || newUnit.monthlyRent <= 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-grass text-white hover:bg-grass/90'
            }`}
          >
            Add Unit
          </button>
        </div>
      </div>
      
      {/* Unit List */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-gray-800 mb-4">
          Unit Inventory {units.length > 0 && `(${units.length} Units)`}
        </h4>
        
        {units.length === 0 ? (
          <div className="bg-white p-8 rounded-md text-center text-gray-500 border border-gray-200">
            <p>No units added yet. Add your first unit using the form above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Unit #
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Sq. Ft.
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Rent
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Occupancy
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Rent/Sq.Ft.
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {units.map((unit) => (
                  <tr key={unit.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{unit.unitNumber}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {unit.bedrooms} BD / {unit.bathrooms} BA
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{unit.sqft}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <CurrencyInput
                          value={unit.monthlyRent}
                          onChange={(value) => updateUnit(unit.id, 'monthlyRent', value)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 w-24">
                        <PercentageInput
                          value={unit.occupancyRate / 100}
                          onChange={(value) => updateUnit(unit.id, 'occupancyRate', value * 100)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${(unit.monthlyRent / unit.sqft).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => duplicateUnit(unit)}
                        className="text-navy hover:text-navy/80"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => removeUnit(unit.id)}
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
        )}
      </div>
      
      {/* Property Income Summary */}
      {units.length > 0 && (
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <h4 className="text-lg font-medium text-green-800 mb-4">Property Income Summary</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
              <h5 className="font-medium text-green-800 mb-3">Income Metrics</h5>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total Monthly Rent:</span>
                  <span className="text-xl font-semibold text-green-700">
                    ${stats.totalRent.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Effective Gross Income:</span>
                  <span className="text-xl font-semibold text-green-700">
                    ${Math.round(stats.effectiveGrossIncome).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Average Rent per Unit:</span>
                  <span className="text-lg font-medium text-gray-900">
                    ${Math.round(stats.averageRent).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Average Rent per Sq.Ft.:</span>
                  <span className="text-lg font-medium text-gray-900">
                    ${stats.averageRentPerSqft.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
              <h5 className="font-medium text-green-800 mb-3">Property Metrics</h5>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-800">Total Units</span>
                  <p className="text-2xl font-bold text-green-700">{stats.totalUnits}</p>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-800">Total Sq.Ft.</span>
                  <p className="text-2xl font-bold text-green-700">{stats.totalSqft.toLocaleString()}</p>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-800">Total Bedrooms</span>
                  <p className="text-2xl font-bold text-green-700">{stats.totalBedrooms}</p>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-800">Total Bathrooms</span>
                  <p className="text-2xl font-bold text-green-700">{stats.totalBathrooms}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Multi-Family Tips */}
      <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
        <h4 className="text-lg font-medium text-amber-800 mb-2">Multi-Family Investment Tips</h4>
        
        <ul className="list-disc list-inside text-amber-700 space-y-1">
          <li>Review past rent rolls and occupancy rates to verify income</li>
          <li>Calculate cost per unit and compare to local market averages</li>
          <li>Budget 5% of gross income for vacancy, even in strong markets</li>
          <li>Larger properties (5+ units) typically have economies of scale for expenses</li>
          <li>Consider the potential for future rent increases in your analysis</li>
        </ul>
      </div>
    </div>
  );
}
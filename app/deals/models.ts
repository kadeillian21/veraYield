import { ProjectionConfig } from '../utils/deals/projectionEngine';

export interface Deal {
  id: string;
  name: string;
  address: string;
  strategy: InvestmentStrategy;
  createdAt: Date;
  updatedAt: Date;
  config: ExtendedProjectionConfig;
};

//! Strategy Types
// Extended type for our all-strategy config
export interface ExtendedProjectionConfig extends ProjectionConfig {
  // STR specific fields
  strIncome?: STRIncomeType;
  strExpenses?: STRExpensesType;
  // Multi-family specific fields
  units?: RentalUnit[];
  // House hack specific fields
  houseHack?: HouseHackConfiguration;
  // General
  purchasePrice?: number;
}

export enum DealTypes {
  LongTermRental = 'longTermRental',
  ShortTermRental = 'shortTermRental',
  BRRRR = 'brrrr',
  Multifamily = 'multifamily',
  Househack = 'houseHack',
}
// Investment strategies supported by the calculator
export type InvestmentStrategy = DealTypes.LongTermRental | DealTypes.ShortTermRental | DealTypes.BRRRR | DealTypes.Multifamily | DealTypes.Househack;

// Define interface for new STR Income structure
export interface STRIncomeType {
  peakSeasonDaily: number;
  peakSeasonOccupancy: number;
  peakSeasonMonths: number[];
  midSeasonDaily: number;
  midSeasonOccupancy: number;
  midSeasonMonths: number[];
  lowSeasonDaily: number;
  lowSeasonOccupancy: number;
  lowSeasonMonths: number[];
  cleaningFee: number;
  otherFees: number;
  platformFee: number; // as a percentage
}

export interface STRExpensesType {
  propertyManagementFee: number; // Percentage of revenue
  cleaningCosts: number; // Cost per clean
  suppliesPerMonth: number;
  utilityExpenses: number; // Monthly
  propertyTaxes: number; // Annual
  insurance: number; // Annual
  furnitureReplacementPercent: number; // Percentage of revenue
  maintenancePercent: number; // Percentage of revenue
  advertisingPerMonth: number;
  subscriptionServices: number; // Monthly
  otherExpenses: number; // Monthly
}

export interface RentalUnit {
  id: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  monthlyRent: number;
  occupancyRate: number; // stored as percentage (e.g., 95)
}

export interface HouseHackConfiguration {
  // Owner's living details
  ownerUnit: {
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    marketRent: number; // What you could rent it for
    personalUsage: number; // Percentage of personal use
    occupancyRate?: number; // Used when moving out
  };
  // Owner's expenses
  currentHousingCost: number; // Current monthly rent or housing payment
  personalUtilities: number;
  combinedUtilities: number; // Utilities for the entire property
  combinedInsurance: number; // Insurance for the entire property
  combinedPropertyTax: number; // Property tax for the entire property
  
  // Additional rental units
  rentalUnits: RentalUnit[];
  
  // Future plans
  futurePlan: 'stay' | 'move-out' | 'sell'; // What to do after first year
  futurePropertyValueChange: number; // Percentage
  futureDateOfChange: number; // Months in future
  
  // Property value reference
  purchasePrice?: number; // Property purchase price for equity calculations
}
//! End Strategy Types

//! Strategy Steps (what screens to use)
// Strategy-specific step configurations
export const strategySteps: Record<InvestmentStrategy, Array<{ id: string; label: string }>> = {
  brrrr: [
    { id: 'property', label: 'Property Info' },
    { id: 'acquisition', label: 'Acquisition' },
    { id: 'rehab', label: 'Rehab' },
    { id: 'rental', label: 'Rental' },
    { id: 'refinance', label: 'Refinance' },
    { id: 'projection', label: 'Projection' },
    { id: 'summary', label: 'Summary' }
  ],
  longTermRental: [
    { id: 'property', label: 'Property Info' },
    { id: 'acquisition', label: 'Acquisition' },
    { id: 'rental', label: 'Rental' },
    { id: 'projection', label: 'Projection' },
    { id: 'summary', label: 'Summary' }
  ],
  shortTermRental: [
    { id: 'property', label: 'Property Info' },
    { id: 'acquisition', label: 'Acquisition' },
    { id: 'str-income', label: 'STR Income' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'projection', label: 'Projection' },
    { id: 'summary', label: 'Summary' }
  ],
  multifamily: [
    { id: 'property', label: 'Property Info' },
    { id: 'acquisition', label: 'Acquisition' },
    { id: 'units', label: 'Units' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'projection', label: 'Projection' },
    { id: 'summary', label: 'Summary' }
  ],
  houseHack: [
    { id: 'property', label: 'Property Info' },
    { id: 'acquisition', label: 'Acquisition' },
    { id: 'personal-unit', label: 'Your Unit' },
    { id: 'rental-units', label: 'Rental Units' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'projection', label: 'Projection' },
    { id: 'summary', label: 'Summary' }
  ]
};
//! End Strategy Steps (what screens to use)

// Default deal configuration
export const defaultDealConfig: ExtendedProjectionConfig = {
    acquisition: {
      purchasePrice: 100000, // Setting a default purchase price
      closingCosts: 3000,
      rehabCosts: 20000,
      rehabDurationMonths: 2,
      purchaseLoanAmount: 80000, // Setting a default loan amount (80% LTV)
      purchaseLoanRate: 0.07,
      purchaseLoanTermYears: 30,
      otherInitialCosts: 0,
      includeHoldingCosts: {
        mortgage: true,
        taxes: true,
        insurance: true,
        maintenance: true,
        propertyManagement: false,
        utilities: true,
        other: false
      }
    },
    operation: {
      monthlyRent: 0,
      otherMonthlyIncome: 0,
      propertyTaxes: 0,
      insurance: 0,
      maintenance: 0,
      propertyManagement: 8, // percentage
      utilities: 0,
      vacancyRate: 5, // percentage
      otherExpenses: 0
    },
    projectionMonths: 60,
    refinanceEvents: [],
    propertyValueChanges: [],
    rentChangeEvents: [],
    expenseChangeEvents: [],
    capitalExpenseEvents: [],
    
    // Short-term rental specific defaults
    strIncome: {
      peakSeasonDaily: 150,
      peakSeasonOccupancy: 90,
      peakSeasonMonths: [6, 7, 8], // Summer months
      midSeasonDaily: 100,
      midSeasonOccupancy: 70,
      midSeasonMonths: [4, 5, 9, 10], // Spring & Fall
      lowSeasonDaily: 80,
      lowSeasonOccupancy: 50,
      lowSeasonMonths: [1, 2, 3, 11, 12], // Winter months
      cleaningFee: 75,
      otherFees: 25,
      platformFee: 3 // percentage
    },
    strExpenses: {
      propertyManagementFee: 20, // percentage
      cleaningCosts: 85, // per turnover
      suppliesPerMonth: 50,
      utilityExpenses: 200,
      propertyTaxes: 2400, // annual
      insurance: 1800, // annual
      furnitureReplacementPercent: 5, // percentage of revenue
      maintenancePercent: 3, // percentage of revenue
      advertisingPerMonth: 50,
      subscriptionServices: 30, // per month
      otherExpenses: 0 // per month
    },
    
    // Multi-family specific defaults
    units: [],
    
    // House hack specific defaults
    houseHack: {
      ownerUnit: {
        unitNumber: 'A',
        bedrooms: 2,
        bathrooms: 1,
        sqft: 900,
        marketRent: 1200,
        personalUsage: 100,
        occupancyRate: 95
      },
      currentHousingCost: 1500,
      personalUtilities: 150,
      combinedUtilities: 100,
      combinedInsurance: 1200,
      combinedPropertyTax: 2400,
      rentalUnits: [],
      futurePlan: 'stay',
      futurePropertyValueChange: 3,
      futureDateOfChange: 12
    },
    
    // Common property price reference
    purchasePrice: 0
};

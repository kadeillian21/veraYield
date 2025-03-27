import { describe, it, expect } from 'vitest';
import {
  generateProjection,
  ProjectionConfig
} from '../projectionEngine';

describe('BRRRR Projection Engine', () => {
  it('generates basic projection with acquisition and rehab phase', () => {
    const config: ProjectionConfig = {
      acquisition: {
        purchasePrice: 100000,
        closingCosts: 3000,
        rehabCosts: 30000,
        rehabDurationMonths: 3,
        purchaseLoanAmount: 80000,
        purchaseLoanRate: 0.06,
        purchaseLoanTermYears: 30
      },
      operation: {
        monthlyRent: 1200,
        otherMonthlyIncome: 0,
        propertyTaxes: 1800,
        insurance: 1200,
        maintenance: 100,
        propertyManagement: 10, // 10% of rent
        utilities: 0,
        vacancyRate: 5, // 5% of rent
        otherExpenses: 50
      },
      projectionMonths: 12
    };

    const result = generateProjection(config);
    
    // Should have 12 monthly snapshots
    expect(result.monthlySnapshots.length).toBe(12);
    
    // Check first month (rehab phase)
    const firstMonth = result.monthlySnapshots[0];
    expect(firstMonth.month).toBe(1);
    expect(firstMonth.propertyValue).toBe(100000);
    expect(firstMonth.totalInvestment).toBe(133000); // 100k + 3k + 30k
    expect(firstMonth.remainingInvestment).toBe(133000);
    expect(firstMonth.loanBalance).toBe(80000);
    expect(firstMonth.monthlyIncome.rent).toBe(0); // No rent during rehab
    expect(firstMonth.cashFlow).toBe(0); // No cash flow during rehab
    
    // Check fourth month (after rehab)
    const fourthMonth = result.monthlySnapshots[3];
    expect(fourthMonth.month).toBe(4);
    expect(fourthMonth.monthlyIncome.rent).toBe(1200); // Should have rent now
    expect(fourthMonth.cashFlow).not.toBe(0); // Should have cash flow now
    
    // Check summary
    expect(result.summary.totalInvestment).toBe(133000);
    expect(result.summary.remainingInvestment).toBe(133000); // No refinance, so unchanged
  });

  it('handles refinance event correctly', () => {
    const config: ProjectionConfig = {
      acquisition: {
        purchasePrice: 100000,
        closingCosts: 3000,
        rehabCosts: 30000,
        rehabDurationMonths: 2,
        purchaseLoanAmount: 80000,
        purchaseLoanRate: 0.06,
        purchaseLoanTermYears: 30
      },
      operation: {
        monthlyRent: 1500,
        otherMonthlyIncome: 0,
        propertyTaxes: 1800,
        insurance: 1200,
        maintenance: 100,
        propertyManagement: 10,
        utilities: 0,
        vacancyRate: 5,
        otherExpenses: 50
      },
      projectionMonths: 12,
      refinanceEvents: [
        {
          month: 3,
          afterRepairValue: 160000,
          refinanceLTV: 0.75,
          refinanceRate: 0.055,
          refinanceTermYears: 30,
          refinanceClosingCosts: 3500
        }
      ]
    };

    const result = generateProjection(config);
    
    // Check month before refinance
    const monthBeforeRefinance = result.monthlySnapshots[1];
    expect(monthBeforeRefinance.month).toBe(2);
    expect(monthBeforeRefinance.loanBalance).toBe(80000);
    expect(monthBeforeRefinance.propertyValue).toBe(100000);
    
    // Check refinance month
    const refinanceMonth = result.monthlySnapshots[2];
    expect(refinanceMonth.month).toBe(3);
    expect(refinanceMonth.propertyValue).toBe(160000); // New ARV
    expect(refinanceMonth.loanBalance).toBe(120000); // 160k * 0.75 LTV
    
    // After refinance, remaining investment should be reduced
    const totalInvestment = 100000 + 3000 + 30000; // 133k
    const refinanceProceeds = 120000 - 3500; // 116.5k (new loan - closing costs)
    const expectedRemainingInvestment = Math.max(0, totalInvestment - refinanceProceeds);
    expect(refinanceMonth.remainingInvestment).toBe(expectedRemainingInvestment);
    
    // Check summary
    expect(result.summary.successfulBRRRR).toBe(refinanceProceeds >= totalInvestment);
  });

  it('handles property value changes and rent changes', () => {
    const config: ProjectionConfig = {
      acquisition: {
        purchasePrice: 100000,
        closingCosts: 3000,
        rehabCosts: 25000,
        rehabDurationMonths: 1,
        otherInitialCosts: 2000
      },
      operation: {
        monthlyRent: 1300,
        otherMonthlyIncome: 0,
        propertyTaxes: 1800,
        insurance: 1200,
        maintenance: 100,
        propertyManagement: 10,
        utilities: 0,
        vacancyRate: 5,
        otherExpenses: 50
      },
      projectionMonths: 24,
      propertyValueChanges: [
        { month: 12, newValue: 135000 }, // 5% annual appreciation
        { month: 24, newValue: 141750 }  // Another 5% appreciation
      ],
      rentChangeEvents: [
        { month: 13, newRent: 1350 } // Rent increase at year 1
      ]
    };

    const result = generateProjection(config);
    
    // Check property value change
    const month12 = result.monthlySnapshots[11];
    expect(month12.month).toBe(12);
    expect(month12.propertyValue).toBe(135000);
    
    // Check rent change
    const month13 = result.monthlySnapshots[12];
    expect(month13.month).toBe(13);
    expect(month13.monthlyIncome.rent).toBe(1350);
    
    // Monthly expense for property management should update based on rent
    const oldPropMgmt = month12.monthlyExpenses.propertyManagement;
    const newPropMgmt = month13.monthlyExpenses.propertyManagement;
    expect(newPropMgmt).toBeGreaterThan(oldPropMgmt);
    expect(newPropMgmt).toBeCloseTo(1350 * 0.1, 2); // 10% of new rent
    
    // Check final value
    const finalMonth = result.monthlySnapshots[23];
    expect(finalMonth.month).toBe(24);
    expect(finalMonth.propertyValue).toBe(141750);
  });

  it('calculates accurate financial metrics in the summary', () => {
    // Create a relatively simple scenario for predictable calculations
    const config: ProjectionConfig = {
      acquisition: {
        purchasePrice: 100000,
        closingCosts: 2000,
        rehabCosts: 20000,
        rehabDurationMonths: 1
      },
      operation: {
        monthlyRent: 1200,
        otherMonthlyIncome: 0,
        propertyTaxes: 1200,
        insurance: 800,
        maintenance: 100,
        propertyManagement: 0, // 0% for simplicity
        utilities: 0,
        vacancyRate: 0, // 0% for simplicity
        otherExpenses: 0
      },
      projectionMonths: 12,
      refinanceEvents: [
        {
          month: 2,
          afterRepairValue: 150000,
          refinanceLTV: 0.75,
          refinanceRate: 0.05,
          refinanceTermYears: 30,
          refinanceClosingCosts: 3000
        }
      ]
    };

    const result = generateProjection(config);
    
    // Calculate expected values for verification
    const totalInvestment = 100000 + 2000 + 20000; // 122k
    const refinanceLoanAmount = 150000 * 0.75; // 112.5k
    const refinanceProceeds = refinanceLoanAmount - 3000; // 109.5k
    const remainingInvestment = Math.max(0, totalInvestment - refinanceProceeds); // 12.5k
    
    // Monthly payment calculation
    const monthlyPayment = 603.62; // Approximate for 112.5k @ 5% for 30 years
    
    // Monthly expenses (post-refinance)
    const monthlyExpenses = monthlyPayment + (1200 / 12) + (800 / 12) + 100;
    
    // Monthly cash flow (post-refinance)
    const monthlyCashFlow = 1200 - monthlyExpenses;
    
    // Annualized cash flow
    const annualizedCashFlow = monthlyCashFlow * 12;
    
    // Expected cash on cash return
    const expectedCashOnCash = remainingInvestment > 0 ? annualizedCashFlow / remainingInvestment : 0;
    
    // Check summary metrics
    expect(result.summary.totalInvestment).toBe(totalInvestment);
    expect(result.summary.remainingInvestment).toBeCloseTo(remainingInvestment, 0);
    
    // Final property value should still be 150k (no other value changes)
    expect(result.summary.finalPropertyValue).toBe(150000);
    
    // Final equity = value - loan balance
    expect(result.summary.finalEquity).toBeCloseTo(150000 - refinanceLoanAmount, 0);
    
    // Cash-on-cash return calculation
    expect(result.summary.cashOnCashReturn).toBeCloseTo(expectedCashOnCash, 1);
    
    // Successful BRRRR check
    expect(result.summary.successfulBRRRR).toBe(remainingInvestment <= 0);
  });
});
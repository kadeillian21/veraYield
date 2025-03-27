import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyCashFlow,
  calculateCashOnCashReturn,
  calculateExpenseRatio,
  meetsOnePercentRule,
  estimateCashFlowWith50PercentRule,
  MonthlyIncome,
  MonthlyExpenses
} from '../cashFlowCalculator';

describe('Cash Flow Calculator', () => {
  describe('calculateMonthlyCashFlow', () => {
    it('calculates correct monthly cash flow', () => {
      const income: MonthlyIncome = {
        rent: 2000,
        otherIncome: 100
      };
      
      const expenses: MonthlyExpenses = {
        mortgage: 800,
        taxes: 200,
        insurance: 100,
        maintenance: 150,
        propertyManagement: 210,
        utilities: 0,
        vacancyAllowance: 100,
        otherExpenses: 50
      };
      
      const cashFlow = calculateMonthlyCashFlow(income, expenses);
      expect(cashFlow).toBe(490);
    });
    
    it('handles negative cash flow correctly', () => {
      const income: MonthlyIncome = {
        rent: 1500,
        otherIncome: 0
      };
      
      const expenses: MonthlyExpenses = {
        mortgage: 1000,
        taxes: 200,
        insurance: 100,
        maintenance: 150,
        propertyManagement: 150,
        utilities: 0,
        vacancyAllowance: 75,
        otherExpenses: 50
      };
      
      const cashFlow = calculateMonthlyCashFlow(income, expenses);
      expect(cashFlow).toBe(-225);
    });
  });

  describe('calculateCashOnCashReturn', () => {
    it('calculates correct cash-on-cash return', () => {
      const annualCashFlow = 6000;
      const totalInvestment = 50000;
      
      const cocReturn = calculateCashOnCashReturn(annualCashFlow, totalInvestment);
      expect(cocReturn).toBe(0.12); // 12% return
    });
    
    it('throws error when investment is zero or negative', () => {
      const annualCashFlow = 6000;
      expect(() => calculateCashOnCashReturn(annualCashFlow, 0)).toThrow();
      expect(() => calculateCashOnCashReturn(annualCashFlow, -10000)).toThrow();
    });
  });

  describe('calculateExpenseRatio', () => {
    it('calculates correct expense ratio', () => {
      const totalExpenses = 1200;
      const totalIncome = 2000;
      
      const ratio = calculateExpenseRatio(totalExpenses, totalIncome);
      expect(ratio).toBe(0.6); // 60% expense ratio
    });
    
    it('throws error when income is zero or negative', () => {
      const totalExpenses = 1200;
      expect(() => calculateExpenseRatio(totalExpenses, 0)).toThrow();
      expect(() => calculateExpenseRatio(totalExpenses, -1000)).toThrow();
    });
  });

  describe('meetsOnePercentRule', () => {
    it('correctly identifies properties that meet the 1% rule', () => {
      // $200,000 property with $2,000 rent (1%)
      expect(meetsOnePercentRule(2000, 200000)).toBe(true);
      
      // $150,000 property with $1,600 rent (> 1%)
      expect(meetsOnePercentRule(1600, 150000)).toBe(true);
      
      // $300,000 property with $2,500 rent (< 1%)
      expect(meetsOnePercentRule(2500, 300000)).toBe(false);
    });
  });

  describe('estimateCashFlowWith50PercentRule', () => {
    it('correctly estimates cash flow using the 50% rule', () => {
      const rent = 2000;
      const mortgagePayment = 800;
      
      // 50% of $2000 = $1000 for operating expenses
      // $2000 - $1000 - $800 = $200 cash flow
      const cashFlow = estimateCashFlowWith50PercentRule(rent, mortgagePayment);
      expect(cashFlow).toBe(200);
    });
    
    it('handles negative estimated cash flow correctly', () => {
      const rent = 1500;
      const mortgagePayment = 1000;
      
      // 50% of $1500 = $750 for operating expenses
      // $1500 - $750 - $1000 = -$250 cash flow
      const cashFlow = estimateCashFlowWith50PercentRule(rent, mortgagePayment);
      expect(cashFlow).toBe(-250);
    });
  });
});
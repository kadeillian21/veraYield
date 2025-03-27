import { describe, it, expect } from 'vitest';
import {
  calculateROI,
  calculateAnnualizedROI,
  calculateIRR,
  calculateCapRate,
  calculateGRM
} from '../investmentMetricsCalculator';

describe('Investment Metrics Calculator', () => {
  describe('calculateROI', () => {
    it('calculates ROI correctly', () => {
      // $10,000 profit on $100,000 investment = 10% ROI
      expect(calculateROI(10000, 100000)).toBe(0.1);
      
      // $-5,000 profit (loss) on $50,000 investment = -10% ROI
      expect(calculateROI(-5000, 50000)).toBe(-0.1);
      
      // $15,000 profit on $60,000 investment = 25% ROI
      expect(calculateROI(15000, 60000)).toBe(0.25);
    });
    
    it('throws error for zero or negative investment', () => {
      expect(() => calculateROI(5000, 0)).toThrow();
      expect(() => calculateROI(10000, -1000)).toThrow();
    });
  });

  describe('calculateAnnualizedROI', () => {
    it('calculates annualized ROI correctly for multi-year investments', () => {
      // $50,000 profit on $100,000 investment over 5 years
      // Total ROI = 50% = 0.5
      // Annualized ROI = (1 + 0.5)^(1/5) - 1 ≈ 0.0845 or 8.45% per year
      expect(calculateAnnualizedROI(50000, 100000, 5)).toBeCloseTo(0.0845, 4);
      
      // $20,000 profit on $80,000 investment over 2 years
      // Total ROI = 25% = 0.25
      // Annualized ROI = (1 + 0.25)^(1/2) - 1 ≈ 0.1180 or 11.8% per year
      expect(calculateAnnualizedROI(20000, 80000, 2)).toBeCloseTo(0.1180, 4);
    });
    
    it('throws error for invalid inputs', () => {
      expect(() => calculateAnnualizedROI(10000, 0, 3)).toThrow();
      expect(() => calculateAnnualizedROI(10000, 50000, 0)).toThrow();
      expect(() => calculateAnnualizedROI(10000, -10000, 3)).toThrow();
      expect(() => calculateAnnualizedROI(10000, 50000, -2)).toThrow();
    });
  });

  describe('calculateIRR', () => {
    it('calculates IRR correctly for basic cash flow series', () => {
      // Initial investment of $1000, then $1100 return after 1 year
      // IRR = 10%
      const cashFlows = [-1000, 1100];
      expect(calculateIRR(cashFlows)).toBeCloseTo(0.1, 4);
      
      // Initial investment of $1000, then $500 per year for 3 years
      // Note: IRR calculation methods can vary slightly depending on implementation
      const cashFlows2 = [-1000, 500, 500, 500];
      expect(calculateIRR(cashFlows2)).toBeCloseTo(0.2338, 4);
    });
    
    it('throws error for insufficient cash flows', () => {
      expect(() => calculateIRR([])).toThrow();
      expect(() => calculateIRR([-1000])).toThrow();
    });
    
    it('returns NaN for cash flows with no valid IRR solution', () => {
      // All positive cash flows have no IRR solution
      const invalidCashFlows = [1000, 500, 300];
      expect(isNaN(calculateIRR(invalidCashFlows))).toBe(true);
    });
  });

  describe('calculateCapRate', () => {
    it('calculates cap rate correctly', () => {
      // $12,000 NOI on $200,000 property = 6% cap rate
      expect(calculateCapRate(12000, 200000)).toBe(0.06);
      
      // $36,000 NOI on $400,000 property = 9% cap rate
      expect(calculateCapRate(36000, 400000)).toBe(0.09);
    });
    
    it('throws error for zero or negative property value', () => {
      expect(() => calculateCapRate(10000, 0)).toThrow();
      expect(() => calculateCapRate(10000, -200000)).toThrow();
    });
  });

  describe('calculateGRM', () => {
    it('calculates Gross Rent Multiplier correctly', () => {
      // $300,000 property with $30,000 annual rent = GRM of 10
      expect(calculateGRM(300000, 30000)).toBe(10);
      
      // $250,000 property with $20,000 annual rent = GRM of 12.5
      expect(calculateGRM(250000, 20000)).toBe(12.5);
    });
    
    it('throws error for zero or negative annual rent', () => {
      expect(() => calculateGRM(200000, 0)).toThrow();
      expect(() => calculateGRM(200000, -10000)).toThrow();
    });
  });
});
import { describe, it, expect } from 'vitest';
import {
  calculateRefinance,
  calculateMinimumARV,
  calculateMaxPurchasePrice,
  RefinanceParams
} from '../refinanceCalculator';

describe('Refinance Calculator', () => {
  describe('calculateRefinance', () => {
    it('calculates correct refinance outcomes for a successful BRRRR', () => {
      const params: RefinanceParams = {
        afterRepairValue: 200000,
        totalInvestment: 140000, // Purchase + Rehab
        refinanceLTV: 0.75,
        refinanceRate: 0.05,
        refinanceTermYears: 30,
        refinanceClosingCosts: 4000
      };
      
      const outcome = calculateRefinance(params);
      
      // New loan = ARV * LTV = 200000 * 0.75 = 150000
      expect(outcome.newLoanAmount).toBe(150000);
      
      // Cash recouped = Loan - Closing costs = 150000 - 4000 = 146000
      expect(outcome.cashRecouped).toBe(146000);
      
      // Remaining investment = Total - Cash recouped = 140000 - 146000 = 0
      // (Since we recouped more than invested)
      expect(outcome.remainingInvestment).toBe(0);
      
      // BRRRR is successful since we recouped more than invested
      expect(outcome.isBRRRRSuccessful).toBe(true);
      
      // Check that the monthly payment is calculated correctly
      expect(outcome.newMonthlyPayment).toBeCloseTo(805.23, 2);
    });
    
    it('calculates correct refinance outcomes for an unsuccessful BRRRR', () => {
      const params: RefinanceParams = {
        afterRepairValue: 180000,
        totalInvestment: 150000, // Purchase + Rehab
        refinanceLTV: 0.75,
        refinanceRate: 0.05,
        refinanceTermYears: 30,
        refinanceClosingCosts: 4000
      };
      
      const outcome = calculateRefinance(params);
      
      // New loan = ARV * LTV = 180000 * 0.75 = 135000
      expect(outcome.newLoanAmount).toBe(135000);
      
      // Cash recouped = Loan - Closing costs = 135000 - 4000 = 131000
      expect(outcome.cashRecouped).toBe(131000);
      
      // Remaining investment = Total - Cash recouped = 150000 - 131000 = 19000
      expect(outcome.remainingInvestment).toBe(19000);
      
      // BRRRR is unsuccessful since we didn't recoup full investment
      expect(outcome.isBRRRRSuccessful).toBe(false);
    });
  });

  describe('calculateMinimumARV', () => {
    it('calculates minimum ARV needed for successful BRRRR', () => {
      const totalInvestment = 140000;
      const refinanceLTV = 0.75;
      const refinanceClosingCosts = 4000;
      
      // Min ARV = (Investment + Closing Costs) / LTV
      // = (140000 + 4000) / 0.75 = 144000 / 0.75 = 192000
      const minARV = calculateMinimumARV(totalInvestment, refinanceLTV, refinanceClosingCosts);
      
      expect(minARV).toBe(192000);
    });
    
    it('handles different LTV values correctly', () => {
      const totalInvestment = 100000;
      const refinanceClosingCosts = 3000;
      
      // Test with 70% LTV
      // Min ARV = (100000 + 3000) / 0.7 = 147143 (rounded up)
      expect(calculateMinimumARV(totalInvestment, 0.7, refinanceClosingCosts)).toBe(147143);
      
      // Test with 80% LTV
      // Min ARV = (100000 + 3000) / 0.8 = 128750 (rounded up)
      expect(calculateMinimumARV(totalInvestment, 0.8, refinanceClosingCosts)).toBe(128750);
    });
  });

  describe('calculateMaxPurchasePrice', () => {
    it('calculates maximum purchase price correctly', () => {
      const arv = 200000;
      const rehabCosts = 35000;
      const refinanceLTV = 0.75;
      const refinanceClosingCosts = 4000;
      
      // Max cash out = ARV * LTV - Closing costs = 200000 * 0.75 - 4000 = 146000
      // Max purchase = Max cash out - Rehab costs = 146000 - 35000 = 111000
      const maxPurchase = calculateMaxPurchasePrice(
        arv, rehabCosts, refinanceLTV, refinanceClosingCosts
      );
      
      expect(maxPurchase).toBe(111000);
    });
    
    it('factors in desired cash buffer correctly', () => {
      const arv = 200000;
      const rehabCosts = 35000;
      const refinanceLTV = 0.75;
      const refinanceClosingCosts = 4000;
      const cashBuffer = 10000;
      
      // Max cash out = ARV * LTV - Closing costs = 200000 * 0.75 - 4000 = 146000
      // Max investment with buffer = Max cash out - Buffer = 146000 - 10000 = 136000
      // Max purchase = Max investment - Rehab costs = 136000 - 35000 = 101000
      const maxPurchase = calculateMaxPurchasePrice(
        arv, rehabCosts, refinanceLTV, refinanceClosingCosts, cashBuffer
      );
      
      expect(maxPurchase).toBe(101000);
    });
    
    it('returns 0 when deal is not feasible', () => {
      // Scenario: Rehab costs are too high relative to ARV
      const arv = 100000;
      const rehabCosts = 90000;
      const refinanceLTV = 0.7;
      const refinanceClosingCosts = 3000;
      
      // Max cash out = ARV * LTV - Closing costs = 100000 * 0.7 - 3000 = 67000
      // Max purchase = Max cash out - Rehab costs = 67000 - 90000 = -23000 (negative)
      // Function should return 0 since purchase price can't be negative
      const maxPurchase = calculateMaxPurchasePrice(
        arv, rehabCosts, refinanceLTV, refinanceClosingCosts
      );
      
      expect(maxPurchase).toBe(0);
    });
  });
});
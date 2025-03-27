import { describe, it, expect } from 'vitest';
import { 
  calculateMonthlyMortgagePayment, 
  calculateAmortizationSchedule 
} from '../mortgageCalculator';

describe('Mortgage Calculator', () => {
  describe('calculateMonthlyMortgagePayment', () => {
    it('calculates correct payment for a standard 30-year mortgage', () => {
      // $300,000 loan at 4.5% for 30 years
      const payment = calculateMonthlyMortgagePayment(300000, 0.045, 30);
      expect(payment).toBeCloseTo(1520.06, 2);
    });

    it('calculates correct payment for a 15-year mortgage', () => {
      // $250,000 loan at 4% for 15 years
      const payment = calculateMonthlyMortgagePayment(250000, 0.04, 15);
      expect(payment).toBeCloseTo(1849.22, 2);
    });

    it('handles 0% interest rate correctly', () => {
      // $100,000 loan at 0% for 10 years
      const payment = calculateMonthlyMortgagePayment(100000, 0, 10);
      expect(payment).toBeCloseTo(833.33, 2);
    });
  });

  describe('calculateAmortizationSchedule', () => {
    it('generates correct amortization schedule', () => {
      // $150,000 loan at 4% for 15 years
      const schedule = calculateAmortizationSchedule(150000, 0.04, 15);
      
      // Check first month
      expect(schedule[0].month).toBe(1);
      expect(schedule[0].payment).toBeCloseTo(1109.53, 2);
      expect(schedule[0].interest).toBeCloseTo(500.00, 2);
      expect(schedule[0].principal).toBeCloseTo(609.53, 2);
      expect(schedule[0].remainingBalance).toBeCloseTo(149390.47, 2);
      
      // Check schedule length
      expect(schedule.length).toBe(15 * 12);
      
      // Check last month (should be close to zero remaining)
      const lastMonth = schedule[schedule.length - 1];
      expect(lastMonth.remainingBalance).toBeCloseTo(0, 0);
    });

    it('calculates interest and principal portions correctly', () => {
      // $200,000 loan at 5% for 30 years
      const schedule = calculateAmortizationSchedule(200000, 0.05, 30);
      
      // Sum of payments should equal loan + interest
      const totalPayments = schedule.reduce((sum, month) => sum + month.payment, 0);
      const totalInterest = schedule.reduce((sum, month) => sum + month.interest, 0);
      const totalPrincipal = schedule.reduce((sum, month) => sum + month.principal, 0);
      
      expect(totalPrincipal).toBeCloseTo(200000, -1);
      expect(totalPayments).toBeCloseTo(totalPrincipal + totalInterest, 0);
    });
  });
});
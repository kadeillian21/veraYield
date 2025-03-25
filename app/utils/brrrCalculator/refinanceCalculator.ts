import { calculateMonthlyMortgagePayment } from './mortgageCalculator';

/**
 * Refinance calculator input parameters
 */
export interface RefinanceParams {
  /** Current property value after rehab */
  afterRepairValue: number;
  /** Total acquisition costs (purchase + rehab) */
  totalInvestment: number;
  /** Loan-to-value ratio for refinance (e.g., 0.75 for 75% LTV) */
  refinanceLTV: number;
  /** Interest rate for the refinance loan */
  refinanceRate: number;
  /** Loan term in years */
  refinanceTermYears: number;
  /** Closing costs for refinance */
  refinanceClosingCosts: number;
}

/**
 * Refinance outcome details
 */
export interface RefinanceOutcome {
  /** New loan amount */
  newLoanAmount: number;
  /** Monthly payment on new loan */
  newMonthlyPayment: number;
  /** Cash recouped from refinance */
  cashRecouped: number;
  /** Remaining investment after cash-out */
  remainingInvestment: number;
  /** Whether all invested capital was recouped */
  isBRRRRSuccessful: boolean;
}

/**
 * Calculates refinance outcomes for BRRRR strategy
 * 
 * @param params - Refinance parameters
 * @returns Refinance outcome details
 */
export function calculateRefinance(
  params: RefinanceParams
): RefinanceOutcome {
  // Calculate new loan amount based on ARV and LTV
  const newLoanAmount = Math.floor(params.afterRepairValue * params.refinanceLTV);
  
  // Calculate monthly payment on new loan
  const newMonthlyPayment = calculateMonthlyMortgagePayment(
    newLoanAmount,
    params.refinanceRate,
    params.refinanceTermYears
  );
  
  // Calculate cash recouped from refinance (loan amount minus closing costs)
  const cashRecouped = newLoanAmount - params.refinanceClosingCosts;
  
  // Calculate remaining investment after refinance
  const remainingInvestment = Math.max(0, params.totalInvestment - cashRecouped);
  
  // BRRRR is successful if all or more capital is recouped
  const isBRRRRSuccessful = cashRecouped >= params.totalInvestment;
  
  return {
    newLoanAmount,
    newMonthlyPayment,
    cashRecouped,
    remainingInvestment,
    isBRRRRSuccessful
  };
}

/**
 * Calculate the minimum ARV needed to recoup all initial investment
 * 
 * @param totalInvestment - Total acquisition costs (purchase + rehab)
 * @param refinanceLTV - Loan-to-value ratio for refinance
 * @param refinanceClosingCosts - Closing costs for refinance
 * @returns Minimum ARV needed
 */
export function calculateMinimumARV(
  totalInvestment: number,
  refinanceLTV: number,
  refinanceClosingCosts: number
): number {
  // For successful BRRRR: ARV * LTV - Closing Costs >= Total Investment
  // Therefore: ARV >= (Total Investment + Closing Costs) / LTV
  const minimumARV = (totalInvestment + refinanceClosingCosts) / refinanceLTV;
  
  return Math.ceil(minimumARV);
}

/**
 * Calculate the maximum purchase price for a BRRRR deal
 * 
 * @param afterRepairValue - Expected ARV
 * @param rehabCosts - Expected rehab costs
 * @param refinanceLTV - Loan-to-value ratio for refinance
 * @param refinanceClosingCosts - Closing costs for refinance
 * @param desiredCashBuffer - Desired cash buffer to keep
 * @returns Maximum purchase price
 */
export function calculateMaxPurchasePrice(
  afterRepairValue: number,
  rehabCosts: number,
  refinanceLTV: number,
  refinanceClosingCosts: number,
  desiredCashBuffer: number = 0
): number {
  // Maximum cash available from refinance
  const maxCashOut = (afterRepairValue * refinanceLTV) - refinanceClosingCosts;
  
  // Maximum investment to be recouped
  const maxInvestment = maxCashOut - desiredCashBuffer;
  
  // Maximum purchase price = Max Investment - Rehab Costs
  const maxPurchase = maxInvestment - rehabCosts;
  
  return Math.floor(Math.max(0, maxPurchase));
}
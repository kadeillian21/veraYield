/**
 * Calculates Return on Investment (ROI)
 * 
 * @param netProfit - Total profit (can be annual or lifetime)
 * @param totalInvestment - Total amount invested
 * @returns ROI as a decimal (e.g., 0.15 for 15%)
 */
export function calculateROI(
  netProfit: number,
  totalInvestment: number
): number {
  if (totalInvestment <= 0) {
    throw new Error('Total investment must be greater than zero');
  }
  
  return Number((netProfit / totalInvestment).toFixed(4));
}

/**
 * Calculates annualized ROI for multi-year investments
 * 
 * @param netProfit - Total profit over the entire period
 * @param totalInvestment - Total amount invested
 * @param years - Number of years
 * @returns Annualized ROI as a decimal
 */
export function calculateAnnualizedROI(
  netProfit: number,
  totalInvestment: number,
  years: number
): number {
  if (totalInvestment <= 0) {
    throw new Error('Total investment must be greater than zero');
  }
  
  if (years <= 0) {
    throw new Error('Years must be greater than zero');
  }
  
  const totalROI = calculateROI(netProfit, totalInvestment);
  // Formula: (1 + totalROI)^(1/years) - 1
  const annualizedROI = Math.pow(1 + totalROI, 1 / years) - 1;
  
  return Number(annualizedROI.toFixed(4));
}

/**
 * Estimates Internal Rate of Return (IRR) for a series of cash flows
 * 
 * @param cashFlows - Array of cash flows (negative for outflows, positive for inflows)
 * @param maxIterations - Maximum iterations for the calculation
 * @param tolerance - Tolerance for convergence
 * @returns Estimated IRR as a decimal
 */
export function calculateIRR(
  cashFlows: number[],
  maxIterations: number = 1000,
  tolerance: number = 0.00001
): number {
  if (cashFlows.length < 2) {
    throw new Error('At least two cash flows are required');
  }
  
  let guess = 0.1; // Initial guess of 10%
  
  // Newton-Raphson method to find IRR
  for (let i = 0; i < maxIterations; i++) {
    let fValue = 0;
    let fPrime = 0;
    
    for (let j = 0; j < cashFlows.length; j++) {
      fValue += cashFlows[j] / Math.pow(1 + guess, j);
      fPrime -= j * cashFlows[j] / Math.pow(1 + guess, j + 1);
    }
    
    // Break if we are close enough to zero
    if (Math.abs(fValue) < tolerance) {
      return Number(guess.toFixed(4));
    }
    
    // Update guess using Newton's method
    guess = guess - fValue / fPrime;
    
    // If guess becomes invalid, return NaN
    if (isNaN(guess) || !isFinite(guess)) {
      return NaN;
    }
  }
  
  // If we didn't converge after max iterations, return NaN
  return NaN;
}

/**
 * Calculates the cap rate for a property
 * 
 * @param netOperatingIncome - Annual NOI (without mortgage)
 * @param propertyValue - Current market value of the property
 * @returns Cap rate as a decimal
 */
export function calculateCapRate(
  netOperatingIncome: number,
  propertyValue: number
): number {
  if (propertyValue <= 0) {
    throw new Error('Property value must be greater than zero');
  }
  
  return Number((netOperatingIncome / propertyValue).toFixed(4));
}

/**
 * Calculates the Gross Rent Multiplier (GRM)
 * 
 * @param propertyValue - Current market value of the property
 * @param annualGrossRent - Annual gross rental income
 * @returns Gross Rent Multiplier
 */
export function calculateGRM(
  propertyValue: number,
  annualGrossRent: number
): number {
  if (annualGrossRent <= 0) {
    throw new Error('Annual gross rent must be greater than zero');
  }
  
  return Number((propertyValue / annualGrossRent).toFixed(2));
}
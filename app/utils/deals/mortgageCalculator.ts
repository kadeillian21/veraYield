/**
 * Calculates monthly mortgage payment
 * 
 * @param principal - The loan amount
 * @param interestRate - Annual interest rate (in decimal form, e.g., 0.05 for 5%)
 * @param termInYears - Loan term in years
 * @returns Monthly payment amount
 */
export function calculateMonthlyMortgagePayment(
  principal: number,
  interestRate: number,
  termInYears: number
): number {
  // Convert annual rate to monthly
  const monthlyRate = interestRate / 12;
  // Convert years to number of monthly payments
  const numberOfPayments = termInYears * 12;
  
  // Edge case for 0% interest rate
  if (interestRate === 0) {
    return principal / numberOfPayments;
  }
  
  // Standard mortgage formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
  const payment = 
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  return Number(payment.toFixed(2));
}

/**
 * Calculates amortization schedule
 * 
 * @param principal - The loan amount
 * @param interestRate - Annual interest rate (in decimal form)
 * @param termInYears - Loan term in years
 * @returns Array of monthly payment records with principal, interest, and remaining balance
 */
export function calculateAmortizationSchedule(
  principal: number,
  interestRate: number,
  termInYears: number
): Array<{
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}> {
  const monthlyPayment = calculateMonthlyMortgagePayment(principal, interestRate, termInYears);
  const monthlyRate = interestRate / 12;
  const numberOfPayments = termInYears * 12;
  
  const schedule = [];
  let balance = principal;
  
  for (let month = 1; month <= numberOfPayments; month++) {
    // Calculate interest for this month
    const interestPayment = balance * monthlyRate;
    // Calculate principal for this month
    const principalPayment = monthlyPayment - interestPayment;
    // Update balance
    balance -= principalPayment;
    
    schedule.push({
      month,
      payment: Number(monthlyPayment.toFixed(2)),
      principal: Number(principalPayment.toFixed(2)),
      interest: Number(interestPayment.toFixed(2)),
      remainingBalance: Number(balance > 0 ? balance.toFixed(2) : 0)
    });
  }
  
  return schedule;
}
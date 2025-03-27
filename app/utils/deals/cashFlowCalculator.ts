/**
 * Represents monthly income sources for a property
 */
export interface MonthlyIncome {
  rent: number;
  otherIncome: number;
}

/**
 * Represents monthly expenses for a property
 */
export interface MonthlyExpenses {
  mortgage: number;
  taxes: number;
  insurance: number;
  maintenance: number;
  propertyManagement: number;
  utilities: number;
  vacancyAllowance: number;
  otherExpenses: number;
  capitalReserves?: number; // Monthly contributions to capital expense reserves
}

/**
 * Calculates monthly cash flow
 * 
 * @param income - Monthly income sources
 * @param expenses - Monthly expenses
 * @returns Net monthly cash flow
 */
export function calculateMonthlyCashFlow(
  income: MonthlyIncome,
  expenses: MonthlyExpenses
): number {
  const totalIncome = income.rent + income.otherIncome;
  
  const totalExpenses = 
    expenses.mortgage +
    expenses.taxes +
    expenses.insurance +
    expenses.maintenance +
    expenses.propertyManagement +
    expenses.utilities +
    expenses.vacancyAllowance +
    expenses.otherExpenses +
    (expenses.capitalReserves || 0); // Include capital reserves
  
  return Number((totalIncome - totalExpenses).toFixed(2));
}

/**
 * Calculates cash-on-cash return
 * 
 * @param annualCashFlow - Annual cash flow (monthly * 12)
 * @param totalInvestment - Total cash invested
 * @returns Cash-on-cash return as a decimal
 */
export function calculateCashOnCashReturn(
  annualCashFlow: number,
  totalInvestment: number
): number {
  if (totalInvestment <= 0) {
    throw new Error('Total investment must be greater than zero');
  }
  
  return Number((annualCashFlow / totalInvestment).toFixed(4));
}

/**
 * Calculates expense ratio
 * 
 * @param totalExpenses - Total monthly expenses
 * @param totalIncome - Total monthly income
 * @returns Expense ratio as a decimal
 */
export function calculateExpenseRatio(
  totalExpenses: number,
  totalIncome: number
): number {
  if (totalIncome <= 0) {
    throw new Error('Total income must be greater than zero');
  }
  
  return Number((totalExpenses / totalIncome).toFixed(4));
}

/**
 * Evaluates the 1% rule (monthly rent should be at least 1% of purchase price)
 * 
 * @param monthlyRent - Monthly rental income
 * @param purchasePrice - Property purchase price
 * @returns Boolean indicating if the property meets the 1% rule
 */
export function meetsOnePercentRule(
  monthlyRent: number,
  purchasePrice: number
): boolean {
  return monthlyRent >= (purchasePrice * 0.01);
}

/**
 * Calculates the 50% rule estimate (expenses ~50% of income)
 * 
 * @param monthlyRent - Monthly rental income
 * @returns Estimated cash flow using the 50% rule
 */
export function estimateCashFlowWith50PercentRule(
  monthlyRent: number,
  mortgagePayment: number
): number {
  // 50% rule: Operating expenses roughly equal 50% of rental income
  const estimatedExpenses = monthlyRent * 0.5;
  // Cash flow = Income - Operating Expenses - Mortgage
  return Number((monthlyRent - estimatedExpenses - mortgagePayment).toFixed(2));
}
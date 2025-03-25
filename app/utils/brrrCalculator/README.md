# BRRRR Real Estate Deal Analyzer

This module provides a comprehensive set of utilities for analyzing BRRRR (Buy, Rehab, Rent, Refinance, Repeat) real estate investment deals. It allows investors to calculate returns and project financial outcomes based on different refinance timelines and market scenarios.

## Features

- **Mortgage Calculator**: Calculate mortgage payments and generate amortization schedules
- **Cash Flow Calculator**: Analyze monthly income, expenses, and cash flow
- **Refinance Calculator**: Evaluate refinance outcomes and capital recapture
- **Investment Metrics**: Calculate ROI, Cash-on-Cash Return, IRR, Cap Rate, and more
- **Time-based Projection Engine**: Model deal performance over time with various scenarios

## Key Capabilities

- Compare refinance timing scenarios (e.g., month 5 vs. month 13)
- Track remaining capital investment over time
- Project cash flow based on rehab timelines
- Model property value changes and rent increases
- Calculate advanced financial metrics like IRR

## Usage Examples

### Basic Mortgage Calculation

```typescript
import { calculateMonthlyMortgagePayment } from '@/app/utils/brrrCalculator';

// Calculate monthly payment for a $200,000 loan at 5% for 30 years
const payment = calculateMonthlyMortgagePayment(200000, 0.05, 30);
console.log(`Monthly payment: $${payment}`); // $1,073.64
```

### Cash Flow Analysis

```typescript
import { 
  calculateMonthlyCashFlow, 
  MonthlyIncome, 
  MonthlyExpenses 
} from '@/app/utils/brrrCalculator';

const income: MonthlyIncome = {
  rent: 1500,
  otherIncome: 100
};

const expenses: MonthlyExpenses = {
  mortgage: 800,
  taxes: 150,
  insurance: 100,
  maintenance: 100,
  propertyManagement: 160,
  utilities: 0,
  vacancyAllowance: 80,
  otherExpenses: 50
};

const cashFlow = calculateMonthlyCashFlow(income, expenses);
console.log(`Monthly cash flow: $${cashFlow}`); // $310
```

### BRRRR Refinance Analysis

```typescript
import { 
  calculateRefinance, 
  RefinanceParams 
} from '@/app/utils/brrrCalculator';

const refinanceParams: RefinanceParams = {
  afterRepairValue: 200000,
  totalInvestment: 150000,
  refinanceLTV: 0.75,
  refinanceRate: 0.05,
  refinanceTermYears: 30,
  refinanceClosingCosts: 3000
};

const outcome = calculateRefinance(refinanceParams);
console.log(`New loan amount: $${outcome.newLoanAmount}`);
console.log(`Cash recouped: $${outcome.cashRecouped}`);
console.log(`Remaining investment: $${outcome.remainingInvestment}`);
console.log(`BRRRR successful: ${outcome.isBRRRRSuccessful}`);
```

### Comprehensive Deal Projection

```typescript
import { 
  generateProjection, 
  ProjectionConfig 
} from '@/app/utils/brrrCalculator';

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
  projectionMonths: 60,
  refinanceEvents: [
    {
      month: 4,
      afterRepairValue: 160000,
      refinanceLTV: 0.75,
      refinanceRate: 0.05,
      refinanceTermYears: 30,
      refinanceClosingCosts: 3500
    }
  ],
  propertyValueChanges: [
    { month: 12, newValue: 165000 }, // Annual appreciation
    { month: 24, newValue: 170000 }
  ],
  rentChangeEvents: [
    { month: 13, newRent: 1250 } // Rent increase after first year
  ]
};

const projection = generateProjection(config);
console.log('Monthly snapshots:', projection.monthlySnapshots);
console.log('Summary:', projection.summary);
```

## Module Structure

- `mortgageCalculator.ts` - Mortgage payment and amortization functions
- `cashFlowCalculator.ts` - Monthly income and expense calculations
- `refinanceCalculator.ts` - BRRRR refinance analysis tools
- `investmentMetricsCalculator.ts` - ROI, IRR, and other investment metrics
- `projectionEngine.ts` - Time-based deal projection system

## Development

Tests for each module are in the `__tests__` directory and can be run with:

```bash
npm test
```
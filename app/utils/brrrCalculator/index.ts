// Re-export all calculator functions and types
export * from './mortgageCalculator';
export * from './cashFlowCalculator';
export * from './refinanceCalculator';
export * from './investmentMetricsCalculator';
export * from './projectionEngine';

/**
 * BRRRR Calculator
 * 
 * This module provides a comprehensive set of utilities for analyzing BRRRR 
 * (Buy, Rehab, Rent, Refinance, Repeat) real estate deals. It includes:
 * 
 * - Mortgage calculation (payments, amortization)
 * - Cash flow analysis
 * - Refinance outcomes
 * - Investment metrics (ROI, IRR, cap rate, etc.)
 * - Time-based projection engine for analyzing deals over time
 * 
 * The projection engine allows for modeling different refinance scenarios,
 * property value changes, rent changes, and other events over time to compare
 * outcomes and optimize investment strategy.
 */
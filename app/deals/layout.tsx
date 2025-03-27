import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'BRRRR Calculator | Analyze Real Estate Investments | VeraYield',
  description: 'Calculate ROI, cash flow, and refinance outcomes for BRRRR strategy properties. Step-by-step analysis with our comprehensive real estate investment calculator.',
  keywords: 'BRRRR calculator, real estate investment, cash flow analysis, refinance calculator, rental property calculator',
  openGraph: {
    title: 'VeraYield BRRRR Calculator | Real Estate Investment Analysis',
    description: 'Our comprehensive BRRRR calculator lets you analyze every step of the Buy, Rehab, Rent, Refinance, Repeat strategy to maximize returns.',
    images: [{ url: '/og-brrrr-calculator.jpg' }],
  },
};

export default function DealsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
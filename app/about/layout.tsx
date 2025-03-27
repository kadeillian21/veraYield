import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'About VeraYield | Best BRRRR Calculator for Real Estate Investors',
  description: 'Learn how our professional-grade BRRRR calculator helps real estate investors analyze Buy, Rehab, Rent, Refinance, Repeat strategies to maximize returns.',
  keywords: 'BRRRR calculator, real estate investment software, property analysis tools, BRRRR strategy, real estate calculator',
  openGraph: {
    title: 'About VeraYield | The Leading BRRRR Calculator',
    description: 'Discover why our BRRRR calculator is trusted by real estate investors for analyzing Buy, Rehab, Rent, Refinance, Repeat investment strategies.',
    images: [{ url: '/og-about.jpg' }],
  },
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
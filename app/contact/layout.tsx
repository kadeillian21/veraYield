import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Contact Us | VeraYield BRRRR Calculator',
  description: 'Get in touch with our team for questions about our BRRRR calculator or real estate investment analysis tools.',
  keywords: 'BRRRR calculator contact, real estate investment help, VeraYield support',
};

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
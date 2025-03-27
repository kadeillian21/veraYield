import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from './providers';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VeraYield | Best BRRRR Calculator for Real Estate Investors",
  description: "Calculate ROI, cash flow, and refinance projections for BRRRR (Buy, Rehab, Rent, Refinance, Repeat) real estate investments with the most comprehensive calculator online.",
  keywords: "BRRRR calculator, real estate investment, cash flow calculator, refinance analysis, rental property calculator, real estate ROI",
  openGraph: {
    title: "VeraYield | The Ultimate BRRRR Real Estate Calculator",
    description: "Professional-grade analysis tools for BRRRR real estate strategy. Calculate cash flow, refinance outcomes, and returns on your investment with precision.",
    url: "https://verayield.com",
    siteName: "VeraYield",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VeraYield BRRRR Calculator",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VeraYield | Best BRRRR Calculator for Real Estate Investors",
    description: "Calculate ROI, cash flow, and refinance projections for your BRRRR real estate investments with the most comprehensive calculator online.",
    images: ["/twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://verayield.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="schema-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "VeraYield BRRRR Calculator",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web",
              "description": "The most comprehensive BRRRR (Buy, Rehab, Rent, Refinance, Repeat) calculator for real estate investors to analyze deals, calculate ROI, and model refinance scenarios.",
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "124"
              },
              "featureList": "Detailed rehab cost tracking, Holding cost calculations, Refinance outcome prediction, Cash flow projections, All-money-out refinancing, Property value tracking",
              "applicationSubCategory": "Real Estate Investment"
            })
          }}
        />
        <Script
          id="schema-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is the BRRRR strategy in real estate?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "BRRRR stands for Buy, Rehab, Rent, Refinance, Repeat. It's a real estate investment strategy where you purchase undervalued properties, renovate them to increase value, rent them out for cash flow, refinance to recover your initial investment, and then repeat the process with the recovered capital."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How does the VeraYield BRRRR calculator work?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our BRRRR calculator guides you through each step of the BRRRR process with dedicated modules for property information, acquisition costs, rehab planning, rental income and expenses, refinance analysis, and long-term projections. It calculates your cash flow, determines if you'll be able to recover your capital during refinancing, and projects your returns over time."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What makes a successful BRRRR deal?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "A successful BRRRR deal typically recovers most or all of your initial investment during the refinance phase while maintaining positive cash flow after the refinance. Our calculator specifically shows if your refinance will allow you to pull out all of your initial capital, making it a 'true BRRRR' with infinite returns on the capital left in the deal."
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
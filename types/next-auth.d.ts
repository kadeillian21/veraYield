import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique identifier */
      id: string;
      
      /** Default session properties */
      name?: string | null;
      email?: string | null;
      image?: string | null;
      
      /** Added custom properties */
      annualSavings?: number | null;
      stateOfResidence?: string | null;
      investorType?: string | null;
      investmentGoals?: string[];
      preferredMarkets?: string[];
    } & DefaultSession['user'];
  }

  interface User {
    /** The user's unique identifier */
    id: string;
    
    /** Default user properties */
    name?: string | null;
    email?: string | null;
    image?: string | null;
    
    /** Added custom properties */
    annualSavings?: number | null;
    stateOfResidence?: string | null;
    investorType?: string | null;
    investmentGoals?: string[];
    preferredMarkets?: string[];
    password?: string | null;
  }
}
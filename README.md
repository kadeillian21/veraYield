# VeraYield

Modern Real Estate Investment Analysis Platform

## Features

- Real estate investment deal analysis
- Multiple investment strategies (BRRRR, Long-term Rental, Short-term Rental, Multi-family, House Hack)
- User authentication with Google OAuth
- Save and manage deals
- Investment metrics calculations
- Cash flow projections

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- Prisma ORM
- NextAuth.js
- PostgreSQL
- Chart.js

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file to `.env.local` and update the environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Set up the following environment variables in `.env.local`:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for development)
   - `NEXTAUTH_SECRET`: A random string for session encryption (generate with `openssl rand -base64 32`)
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

5. Set up Google OAuth
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add "http://localhost:3000" to "Authorized JavaScript origins"
   - Add "http://localhost:3000/api/auth/callback/google" to "Authorized redirect URIs"
   - Copy the client ID and client secret to your `.env.local` file

6. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```

7. Run the development server:
   ```bash
   npm run dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app` - Next.js application routes and components
- `/app/api` - API routes
- `/app/components` - React components
- `/app/utils` - Utility functions and business logic
- `/prisma` - Prisma ORM schema and migrations
- `/public` - Static assets

## License

This project is licensed under the MIT License.

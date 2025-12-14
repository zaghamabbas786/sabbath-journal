# Sabbath Journal



## Features

- **Clerk Authentication**: Secure user authentication
- **Trial Period**: Configurable trial period for new users (0-N days)
- **Stripe Payments**: One-time payment for full access
- **Supabase Database**: Cloud database for storing journal entries
- **Google Gemini AI**: AI-powered spiritual guidance and prompts
- **Next.js 15**: Latest Next.js with App Router
- **TypeScript**: Full type safety
- **Tailwind CSS**: Modern styling

## Tech Stack

- **Framework**: Next.js 15.1.0
- **React**: 19.0.0
- **Authentication**: Clerk 6.0.0
- **Payments**: Stripe 17.4.0
- **Database**: Supabase 2.47.0
- **AI**: Google Generative AI 0.21.0
- **Styling**: Tailwind CSS 3.4.17

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env.local` file with the following variables:
   ```env
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   # Note: STRIPE_WEBHOOK_SECRET is not required - payments are verified directly via Stripe API

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Google Gemini
   GEMINI_API_KEY=your_gemini_api_key

   # Trial Period (optional)
   # Set to 0 to disable trial period
   # Set to any number (e.g., 4) to enable trial for that many days
   NEXT_PUBLIC_TRIAL_PERIOD_DAYS=4
   ```

3. **Supabase Database Setup:**
   Run the migration files in `supabase/migrations/` or create tables manually:
   
   **Users Table:**
   ```sql
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id TEXT UNIQUE NOT NULL,
     name TEXT,
     email TEXT,
     has_paid BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE INDEX idx_users_user_id ON users(user_id);
   ```

   **Journal Entries Table:**
   ```sql
   CREATE TABLE journal_entries (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id TEXT NOT NULL,
     date TIMESTAMPTZ NOT NULL,
     steps JSONB NOT NULL,
     declaration JSONB,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
   CREATE INDEX idx_journal_entries_date ON journal_entries(date DESC);
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── gemini/       # AI service endpoints
│   │   └── payment/      # Stripe payment endpoints
│   ├── sign-in/          # Clerk sign-in page
│   ├── sign-up/          # Clerk sign-up page
│   ├── layout.tsx        # Root layout with Clerk provider
│   ├── page.tsx          # Main journal app
│   └── globals.css       # Global styles
├── components/            # React components
├── lib/                  # Utility libraries
│   ├── gemini.ts         # Google Gemini AI service
│   ├── stripe.ts         # Stripe configuration
│   └── supabase.ts       # Supabase client and services
├── types.ts              # TypeScript types
├── constants.ts          # App constants
└── middleware.ts         # Clerk middleware
```

## DRY Principles Applied

- Centralized API service functions in `lib/` directory
- Reusable components with clear separation of concerns
- Shared types and constants
- Consistent error handling patterns
- Single source of truth for configuration

## Payment & Trial Flow

1. User signs up/signs in with Clerk
2. User is automatically created in Supabase `users` table
3. **Trial Period Check:**
   - If `NEXT_PUBLIC_TRIAL_PERIOD_DAYS` is set (e.g., 4), user gets free access for that many days from account creation
   - If set to 0, no trial period and payment is required immediately
   - Trial period is calculated from user's `created_at` timestamp in the database
4. When trial expires or if no trial:
   - User clicks "Complete Payment" after finishing journal steps
   - Stripe Checkout session is created
   - User completes payment
   - Payment is verified via Stripe API
   - User gains permanent access to create journal entries

### Trial Period Configuration

The trial period is controlled by the `NEXT_PUBLIC_TRIAL_PERIOD_DAYS` environment variable:
- **0**: No trial, payment required immediately
- **4**: 4-day trial period (recommended)
- **7**: 7-day trial period
- **Any number**: N-day trial period

During the trial, users see: "Trial: X days remaining"

## Database

The app uses Supabase for storing journal entries. Each entry is associated with a user ID from Clerk. The database schema stores:
- User ID (from Clerk)
- Entry date
- Steps (JSON array)
- Declaration (optional JSON object)




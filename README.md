# Sabbath Journal



## Features

- **Clerk Authentication**: Secure user authentication
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
   ```

3. **Supabase Database Setup:**
   Create a table called `journal_entries` with the following schema:
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

## Payment Flow

1. User signs up/signs in with Clerk
2. User clicks "Unlock Full Access" button
3. Stripe Checkout session is created
4. User completes payment
5. Webhook confirms payment
6. User gains access to create journal entries

## Database

The app uses Supabase for storing journal entries. Each entry is associated with a user ID from Clerk. The database schema stores:
- User ID (from Clerk)
- Entry date
- Steps (JSON array)
- Declaration (optional JSON object)




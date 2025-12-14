# Libraries and Versions Used

This document lists all the libraries used in this project with their latest versions as of the conversion date.

## Core Framework
- **Next.js**: 15.1.0 - Latest stable version with App Router
- **React**: 19.0.0 - Latest React version
- **TypeScript**: 5.7.0 - Latest TypeScript version

## Authentication
- **@clerk/nextjs**: 6.0.0 - Latest Clerk SDK for Next.js
  - Provides authentication, user management, and session handling
  - Used for: User authentication and authorization

## Payments
- **stripe**: 17.4.0 - Latest Stripe Node.js SDK
  - Used for: One-time payment processing via Stripe Checkout

## Database
- **@supabase/supabase-js**: 2.47.0 - Latest Supabase JavaScript client
  - Used for: Database operations (no auth, just DB)
  - Note: Only using Supabase for database, not authentication

## AI Services
- **@google/generative-ai**: 0.21.0 - Latest Google Generative AI SDK
  - Used for: AI-powered spiritual guidance, nudges, blessings, and declarations
  - Model: gemini-1.5-flash

## Styling
- **tailwindcss**: 3.4.17 - Latest Tailwind CSS
- **postcss**: 8.4.49 - PostCSS for Tailwind
- **autoprefixer**: 10.4.20 - Autoprefixer for CSS

## Development Tools
- **eslint**: 9.17.0 - Latest ESLint
- **eslint-config-next**: 15.1.0 - Next.js ESLint config
- **@types/node**: 22.10.0 - Node.js type definitions
- **@types/react**: 19.0.0 - React type definitions
- **@types/react-dom**: 19.0.0 - React DOM type definitions

## Design Principles Applied

### DRY (Don't Repeat Yourself)
- Centralized API service functions in `lib/` directory
- Reusable React components with clear separation of concerns
- Shared TypeScript types and constants
- Consistent error handling patterns
- Single source of truth for configuration

### Latest Versions
All libraries have been updated to their latest stable versions as of the conversion date. This ensures:
- Latest security patches
- Best performance
- Modern features and APIs
- Long-term support

## Notes

1. **Clerk Authentication**: Handles all user authentication. No Supabase auth is used.
2. **Stripe Payments**: One-time payment of $10 for full access. Payment status is tracked by checking if user has created entries.
3. **Supabase Database**: Only used for data storage. RLS is disabled since we use Clerk for auth.
4. **Google Gemini AI**: Used for generating spiritual guidance. All AI calls are made server-side via API routes.








// Webhook endpoint is optional - payments are verified directly via Stripe API
// This endpoint can be removed or kept for logging purposes
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Webhook is not required - payments are verified directly from Stripe API
  // You can remove this file or keep it for future use
  return NextResponse.json({ message: 'Webhook not required - using direct API verification' });
}






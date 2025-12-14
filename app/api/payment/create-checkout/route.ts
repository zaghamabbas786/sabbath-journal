import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe, PAYMENT_AMOUNT } from '@/lib/stripe';
import { userService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  console.log('=== CREATE CHECKOUT API CALLED ===');
  try {
    const { userId } = await auth();
    console.log('User ID from auth:', userId);
    
    if (!userId) {
      console.log('❌ No userId - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has access
    console.log('🔄 Checking if user exists in DB...');
    const user = await userService.getUser(userId);
    console.log('User from DB:', user);
    
    if (user?.has_paid) {
      console.log('❌ User already paid - returning 400');
      return NextResponse.json({ error: 'Already has access' }, { status: 400 });
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000';
    console.log('Origin:', origin);
    console.log('Payment amount:', PAYMENT_AMOUNT);
    
    console.log('🔄 Creating Stripe session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Sabbath Journal - Save Entry',
              description: 'One-time payment of $4 to save your journal entry',
            },
            unit_amount: PAYMENT_AMOUNT,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?payment=cancelled`,
      client_reference_id: userId,
      metadata: {
        userId,
      },
    });

    console.log('✅ Stripe session created:', session.id);
    console.log('✅ Checkout URL:', session.url);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session: ' + (error as Error).message }, { status: 500 });
  }
}






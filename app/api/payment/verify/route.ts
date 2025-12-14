import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { userService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  console.log('=== VERIFY PAYMENT API CALLED ===');
  try {
    const { userId } = await auth();
    console.log('User ID from auth:', userId);
    
    if (!userId) {
      console.log('❌ No userId - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await request.json();
    console.log('Session ID:', sessionId);
    
    if (!sessionId) {
      console.log('❌ No session ID');
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Retrieve the checkout session from Stripe
    console.log('🔄 Retrieving Stripe session...');
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Stripe session payment_status:', session.payment_status);
    console.log('Stripe session client_reference_id:', session.client_reference_id);
    console.log('Stripe session metadata:', session.metadata);

    // Verify the session belongs to this user and payment is complete
    const isValid =
      session.payment_status === 'paid' &&
      (session.metadata?.userId === userId || session.client_reference_id === userId);

    console.log('Is Valid:', isValid);

    if (isValid) {
      // Update payment status in users table
      console.log('🔄 Updating payment status in DB...');
      await userService.updatePaymentStatus(userId, true);
      console.log('✅ Payment verified, user status updated to has_paid = true');
    } else {
      console.log('❌ Payment not valid');
      console.log('  - payment_status:', session.payment_status);
      console.log('  - metadata.userId:', session.metadata?.userId);
      console.log('  - client_reference_id:', session.client_reference_id);
      console.log('  - expected userId:', userId);
    }

    return NextResponse.json({ verified: isValid });
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    return NextResponse.json({ error: 'Failed to verify payment: ' + (error as Error).message }, { status: 500 });
  }
}

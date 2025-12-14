import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userService } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  console.log('=== PAYMENT STATUS API CALLED ===');
  try {
    const { userId } = await auth();
    console.log('User ID from auth:', userId);
    
    if (!userId) {
      console.log('❌ No userId - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check payment status from users table
    console.log('🔄 Fetching user from DB...');
    const user = await userService.getUser(userId);
    console.log('User from DB:', user);
    
    const hasPaid = user?.has_paid ?? false;
    console.log('✅ Returning hasPaid:', hasPaid);

    return NextResponse.json({ hasPaid });
  } catch (error) {
    console.error('❌ Error checking payment status:', error);
    return NextResponse.json({ error: 'Failed to check payment status: ' + (error as Error).message }, { status: 500 });
  }
}






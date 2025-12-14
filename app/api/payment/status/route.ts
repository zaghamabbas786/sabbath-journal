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

    // Check user access (payment + trial)
    console.log('🔄 Checking user access...');
    const accessStatus = await userService.checkUserAccess(userId);
    console.log('Access status:', accessStatus);

    return NextResponse.json({
      hasPaid: accessStatus.hasPaid,
      hasAccess: accessStatus.hasAccess,
      isInTrial: accessStatus.isInTrial,
      daysRemaining: accessStatus.daysRemaining,
    });
  } catch (error) {
    console.error('❌ Error checking payment status:', error);
    return NextResponse.json({ error: 'Failed to check payment status: ' + (error as Error).message }, { status: 500 });
  }
}






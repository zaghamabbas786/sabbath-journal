import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { userService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  console.log('=== USER SYNC API CALLED ===');
  try {
    const { userId } = await auth();
    console.log('User ID from auth:', userId);
    
    if (!userId) {
      console.log('❌ No userId - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from Clerk
    console.log('🔄 Fetching Clerk user...');
    const clerkUser = await currentUser();
    console.log('Clerk user:', clerkUser?.id, clerkUser?.emailAddresses?.[0]?.emailAddress);
    
    if (!clerkUser) {
      console.log('❌ Clerk user not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Sync user data to Supabase
    console.log('🔄 Syncing user to Supabase...');
    const user = await userService.createOrUpdateUser(userId, {
      name: clerkUser.fullName || clerkUser.firstName || null,
      email: clerkUser.emailAddresses[0]?.emailAddress || null,
    });
    console.log('✅ User synced:', user);

    return NextResponse.json({ user, hasPaid: user.has_paid });
  } catch (error) {
    console.error('❌ Error syncing user:', error);
    return NextResponse.json({ error: 'Failed to sync user: ' + (error as Error).message }, { status: 500 });
  }
}

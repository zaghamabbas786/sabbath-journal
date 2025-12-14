import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { journalService } from '@/lib/supabase';
import { JournalEntry } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entryData } = await request.json();
    if (!entryData) {
      return NextResponse.json({ error: 'Entry data required' }, { status: 400 });
    }

    // Save entry to Supabase
    const entry: Omit<JournalEntry, 'id' | 'userId'> = {
      date: entryData.date || new Date().toISOString(),
      steps: entryData.steps,
      declaration: entryData.declaration || undefined,
    };

    await journalService.saveEntry(userId, entry);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving entry:', error);
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
  }
}

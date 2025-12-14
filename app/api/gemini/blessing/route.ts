import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateBlessing } from '@/lib/gemini';
import { StepAnswer } from '@/types';

// Fallback blessings when AI is unavailable
const FALLBACK_BLESSINGS = [
  "May the Lord bless you and keep you; may His face shine upon you and be gracious to you.",
  "The Lord is your shepherd; you shall not want. He leads you beside still waters and restores your soul.",
  "Be strong and courageous. Do not be afraid, for the Lord your God goes with you wherever you go.",
  "May you find peace in His presence and strength in His promises.",
  "The Lord has heard your heart. Rest in His unfailing love.",
];

export async function POST(request: NextRequest) {
  try {
    // Authentication is optional - allow unauthenticated users
    await auth();

    const body = await request.json();
    const { answers }: { answers: StepAnswer[] } = body;

    const blessing = await generateBlessing(answers);
    
    if (blessing) {
      return NextResponse.json({ blessing });
    }
    
    // Return a random fallback if AI returns null
    const fallback = FALLBACK_BLESSINGS[Math.floor(Math.random() * FALLBACK_BLESSINGS.length)];
    return NextResponse.json({ blessing: fallback });
  } catch (error) {
    console.error('Error generating blessing:', error);
    
    // Return a fallback blessing instead of error
    const fallback = FALLBACK_BLESSINGS[Math.floor(Math.random() * FALLBACK_BLESSINGS.length)];
    console.log('Using fallback blessing due to error');
    return NextResponse.json({ blessing: fallback });
  }
}


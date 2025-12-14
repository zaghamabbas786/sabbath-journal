import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateGentleNudge } from '@/lib/gemini';
import { StepAnswer } from '@/types';

// Fallback nudges by step ID
const FALLBACK_NUDGES: Record<number, string[]> = {
  1: [
    "Take a deep breath. What moment from today is still lingering in your heart?",
    "Close your eyes for a moment. What scene keeps replaying in your mind?",
  ],
  2: [
    "Where in your body do you feel this emotion? Your chest, your shoulders, your stomach?",
    "If this feeling had a color or texture, what would it be?",
  ],
  3: [
    "Imagine Jesus sitting beside you right now. What do you see in His eyes as He looks at you?",
    "What would it feel like to have His hand on your shoulder in this moment?",
  ],
  4: [
    "What words do you sense He might be speaking over you right now?",
    "If He could whisper one truth to your heart, what might it be?",
  ],
  5: [
    "What old belief is being challenged by this new truth?",
    "What lie have you been believing that contradicts what He's showing you?",
  ],
  6: [
    "How might tomorrow look different if you carried this truth with you?",
    "What one small step could you take to live from this place of peace?",
  ],
};

export async function POST(request: NextRequest) {
  try {
    // Authentication is optional - allow unauthenticated users
    await auth();

    const body = await request.json();
    const { currentStepId, previousAnswers }: { currentStepId: number; previousAnswers: StepAnswer[] } = body;

    const suggestion = await generateGentleNudge(currentStepId, previousAnswers);
    
    if (suggestion) {
      return NextResponse.json({ suggestion });
    }
    
    // Return a random fallback for this step
    const stepNudges = FALLBACK_NUDGES[currentStepId] || FALLBACK_NUDGES[1];
    const fallback = stepNudges[Math.floor(Math.random() * stepNudges.length)];
    return NextResponse.json({ suggestion: fallback });
  } catch (error) {
    console.error('Error generating nudge:', error);
    
    // Return a fallback nudge instead of error
    const stepNudges = FALLBACK_NUDGES[1];
    const fallback = stepNudges[Math.floor(Math.random() * stepNudges.length)];
    console.log('Using fallback nudge due to error');
    return NextResponse.json({ suggestion: fallback });
  }
}


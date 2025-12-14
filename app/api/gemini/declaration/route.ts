import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateScriptureDeclaration } from '@/lib/gemini';
import { StepAnswer } from '@/types';

// Fallback declarations when AI is unavailable
const FALLBACK_DECLARATIONS = [
  { lie: "I am alone in my struggles", truth: "always with me, even in the darkest valley (Psalm 23:4)" },
  { lie: "I am not enough", truth: "my strength is made perfect in weakness (2 Corinthians 12:9)" },
  { lie: "I am forgotten", truth: "He who began a good work in me will carry it on to completion (Philippians 1:6)" },
  { lie: "I cannot be forgiven", truth: "faithful and just to forgive my sins (1 John 1:9)" },
  { lie: "I have no purpose", truth: "He has plans to prosper me and give me hope and a future (Jeremiah 29:11)" },
];

export async function POST(request: NextRequest) {
  try {
    // Authentication is optional - allow unauthenticated users
    await auth();

    const body = await request.json();
    const { answers }: { answers: StepAnswer[] } = body;

    const declaration = await generateScriptureDeclaration(answers);
    
    if (declaration) {
      return NextResponse.json(declaration);
    }
    
    // Return a random fallback if AI returns null
    const fallback = FALLBACK_DECLARATIONS[Math.floor(Math.random() * FALLBACK_DECLARATIONS.length)];
    return NextResponse.json(fallback);
  } catch (error) {
    console.error('Error generating declaration:', error);
    
    // Return a fallback declaration instead of error
    // This ensures users still get a meaningful experience
    const fallback = FALLBACK_DECLARATIONS[Math.floor(Math.random() * FALLBACK_DECLARATIONS.length)];
    console.log('Using fallback declaration due to error');
    return NextResponse.json(fallback);
  }
}


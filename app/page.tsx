'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import { AppState, StepAnswer, JournalEntry } from '@/types';
import { IMMANUEL_STEPS } from '@/constants';
import { PaperContainer } from '@/components/PaperContainer';
import { FeatherIcon, SparklesIcon, ChevronRightIcon, BookIcon, XIcon } from '@/components/Icons';
import { SoundPlayer } from '@/components/SoundPlayer';
import { Toast, useToast } from '@/components/Toast';
import { journalService } from '@/lib/supabase';
import { storageService } from '@/lib/storage';

// Sub-components
const LandingScreen: React.FC<{ 
  onStart: () => void; 
  onArchive: () => void;
  isAuthenticated: boolean;
  hasPaid: boolean;
}> = ({ onStart, onArchive, isAuthenticated, hasPaid }) => {
  const handleStart = () => {
    if (!isAuthenticated) {
      // Redirect to sign-in if not authenticated
      window.location.href = '/sign-in';
      return;
    }
    onStart();
  };

  const handleArchive = () => {
    if (!isAuthenticated) {
      // Redirect to sign-in if not authenticated
      window.location.href = '/sign-in';
      return;
    }
    onArchive();
  };

  return (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-stone-100 rounded-full flex items-center justify-center border border-stone-200">
          <FeatherIcon className="w-8 h-8 text-gold" />
        </div>
        <h1 className="text-5xl md:text-6xl font-serif text-ink tracking-tight">Sabbath</h1>
        <p className="text-lg md:text-xl font-body text-stone-500 italic max-w-md mx-auto">
          &quot;I see you. I hear you. I am with you.&quot;
        </p>
      </div>
      <div className="flex flex-col gap-4 pt-8">
        <button 
          onClick={handleStart}
          className="group relative px-10 py-4 bg-ink text-paper font-serif text-xl rounded-sm overflow-hidden transition-all hover:bg-stone-800 shadow-lg hover:shadow-xl"
        >
          <span className="relative z-10 flex items-center gap-2">
            Begin Journaling <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
        <button 
          onClick={handleArchive}
          className="text-stone-500 hover:text-gold font-body transition-colors flex items-center justify-center gap-2"
        >
          <BookIcon className="w-4 h-4" /> View Past Entries
        </button>
      </div>
    </div>
  );
};

const JournalStepScreen: React.FC<{
  stepIndex: number;
  totalSteps: number;
  answer: string;
  setAnswer: (val: string) => void;
  onNext: () => void;
  previousAnswers: StepAnswer[];
}> = ({ stepIndex, totalSteps, answer, setAnswer, onNext, previousAnswers }) => {
  const step = IMMANUEL_STEPS[stepIndex];
  const [isNudgeLoading, setNudgeLoading] = useState(false);
  const [nudgeText, setNudgeText] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNudgeText(null);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [stepIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (answer.trim()) {
        onNext();
      }
    }
  };

  const handleNudge = async () => {
    setNudgeLoading(true);
    try {
      const response = await fetch('/api/gemini/nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStepId: step.id, previousAnswers }),
      });
      const data = await response.json();
      if (data.suggestion) {
        setNudgeText(data.suggestion);
      }
    } catch (error) {
      console.error('Error fetching nudge:', error);
    }
    setNudgeLoading(false);
  };

  return (
    <div className="flex flex-col h-full animate-slide-up">
      <div className="flex justify-between items-center mb-8 text-stone-400 font-serif text-sm tracking-widest uppercase">
        <span>Step {stepIndex + 1} of {totalSteps}</span>
        <span>{step.title}</span>
      </div>

      <div ref={scrollRef} className="flex-grow flex flex-col space-y-6 overflow-y-auto">
        <div className="space-y-4">
          <p className="text-gold font-serif italic text-3xl md:text-4xl leading-snug font-medium">
            {step.breathingCue}
          </p>
          
          <h2 className="text-4xl md:text-5xl font-serif text-ink leading-tight py-2">
            {step.primaryPrompt}
          </h2>
          
          <p className="text-stone-700 font-body text-2xl leading-relaxed font-light">
            {step.guidance}
          </p>

          <div className="mt-4 text-stone-500 font-body italic text-xl border-l-4 border-gold/30 pl-6 py-2">
             {step.example}
          </div>
          
          <button 
            onClick={handleNudge}
            disabled={isNudgeLoading}
            className="text-sm font-sans text-stone-400 hover:text-gold transition-colors flex items-center gap-1 mt-4"
          >
            <SparklesIcon className="w-4 h-4" />
            {isNudgeLoading ? "Listening..." : "Help me hear"}
          </button>
          {nudgeText && (
            <div className="animate-fade-in mt-2 p-4 bg-stone-50 border-l-2 border-gold text-stone-600 font-body italic text-xl">
              &quot;{nudgeText}&quot;
            </div>
          )}
        </div>

        <div className="relative flex-grow mt-8 min-h-[200px]">
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none font-body text-2xl text-ink placeholder:text-stone-300 prose-input p-1"
            placeholder={step.placeholder}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      <div className="pt-8 border-t border-stone-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <button 
          onClick={() => { if(answer.trim()) onNext(); }}
          className="text-base md:text-lg text-stone-400 font-sans hover:text-ink transition-colors cursor-pointer hover:underline underline-offset-4 order-2 md:order-1"
        >
          CMD + Enter to continue
        </button>
        <button
          onClick={onNext}
          disabled={!answer.trim()}
          className="w-full md:w-auto px-10 py-4 bg-ink text-paper text-xl font-serif rounded-sm hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform active:scale-[0.98] order-1 md:order-2"
        >
          {stepIndex === totalSteps - 1 ? "Finish" : "Continue"}
        </button>
      </div>
    </div>
  );
};

const DeclarationScreen: React.FC<{
  answers: StepAnswer[];
  onComplete: (declaration: { lie: string; truth: string }) => void;
}> = ({ answers, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ lie: string; truth: string } | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Prevent duplicate requests (React Strict Mode runs effects twice)
    if (hasFetched.current) return;
    hasFetched.current = true;

    const generate = async () => {
      console.log('🔄 Generating declaration...');
      try {
        const [result] = await Promise.all([
          fetch('/api/gemini/declaration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers }),
          }).then(res => res.json()),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);
        
        console.log('✅ Declaration received:', result);
        setData(result);
      } catch (error) {
        console.error('Error generating declaration:', error);
      } finally {
        setLoading(false);
      }
    };
    generate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency - run only once

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fade-in">
        <SparklesIcon className="w-12 h-12 text-gold animate-pulse mb-6" />
        <p className="text-2xl font-serif text-stone-500 italic">Waiting on the Lord...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fade-in">
        <p className="text-xl font-body text-stone-500">Unable to generate declaration.</p>
        <button onClick={() => onComplete({ lie: "...", truth: "..." })} className="mt-4 text-gold hover:underline">
          Continue to Summary
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-center items-center text-center animate-fade-in p-4">
      <div className="max-w-2xl w-full space-y-12">
        <div className="space-y-4 opacity-80 hover:opacity-100 transition-opacity">
          <p className="text-xl md:text-2xl font-serif text-stone-400 uppercase tracking-widest">I reject the lie that</p>
          <p className="text-3xl md:text-4xl font-body text-stone-600 leading-tight decoration-stone-300 line-through decoration-1">
            {data.lie}
          </p>
        </div>

        <div className="w-16 h-[1px] bg-gold/50 mx-auto"></div>

        <div className="space-y-6">
          <p className="text-xl md:text-2xl font-serif text-gold uppercase tracking-widest font-bold">Instead I declare that my Father is</p>
          <p className="text-4xl md:text-5xl font-serif text-ink leading-tight drop-shadow-sm">
            {data.truth}
          </p>
        </div>

        <div className="pt-12">
          <button 
            onClick={() => onComplete(data)}
            className="px-12 py-4 bg-ink text-paper text-xl font-serif rounded-sm shadow-lg hover:shadow-xl hover:bg-stone-800 transition-all transform active:scale-[0.99]"
          >
            Amen
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryScreen: React.FC<{ 
  answers: StepAnswer[]; 
  declaration: { lie: string; truth: string } | null;
  onSave: () => void;
  onNew: () => void;
}> = ({ answers, declaration, onSave, onNew }) => {
  const [blessing, setBlessing] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Prevent duplicate requests (React Strict Mode runs effects twice)
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchBlessing = async () => {
      console.log('🔄 Fetching blessing...');
      try {
        const response = await fetch('/api/gemini/blessing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers }),
        });
        const data = await response.json();
        console.log('✅ Blessing received:', data.blessing);
        setBlessing(data.blessing);
      } catch (error) {
        console.error('Error fetching blessing:', error);
      }
    };
    fetchBlessing();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency - run only once

  return (
    <div className="h-full flex flex-col animate-fade-in overflow-y-auto pr-2">
      <div className="text-center mb-8">
        <div className="inline-block border-b-2 border-gold pb-2 mb-2">
          <h2 className="text-3xl font-serif text-ink">Letter from the Presence</h2>
        </div>
        <p className="text-stone-500 font-body italic">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="flex-grow space-y-8 font-body text-xl leading-relaxed text-ink/90">
        {declaration && (
          <div className="mb-10 p-8 bg-stone-50 border border-stone-200 rounded-sm text-center shadow-sm">
             <p className="text-stone-400 text-base mb-2 line-through decoration-stone-300">I reject the lie that {declaration.lie}</p>
             <p className="text-2xl font-serif text-ink">Instead I declare that my Father is {declaration.truth}</p>
          </div>
        )}

        {answers.map((step, idx) => (
          <div key={idx} className="mb-6">
            <p className="mb-2 text-sm font-serif text-gold uppercase tracking-wider opacity-70">{IMMANUEL_STEPS[step.stepId-1].title}</p>
            <p className="whitespace-pre-wrap">{step.answer}</p>
          </div>
        ))}

        {blessing && (
          <div className="mt-12 pt-8 border-t border-stone-200 text-center animate-fade-in">
            <p className="font-serif text-2xl text-gold italic">&quot;{blessing}&quot;</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-stone-200 flex justify-center gap-4">
        <button onClick={onSave} className="px-8 py-3 bg-ink text-paper text-lg font-serif rounded-sm shadow hover:shadow-lg transition-all">
          Save & Close
        </button>
      </div>
    </div>
  );
};

const ArchiveScreen: React.FC<{ 
  onBack: () => void;
  isAuthenticated: boolean;
  userId?: string;
}> = ({ onBack, isAuthenticated, userId }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Require authentication to view archive
    if (!isAuthenticated || !userId) {
      window.location.href = '/sign-in';
      return;
    }

    const loadEntries = async () => {
      try {
        const data = await journalService.getEntries(userId);
        setEntries(data);
      } catch (error) {
        console.error('Error loading entries:', error);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    loadEntries();
  }, [isAuthenticated, userId]);

  return (
    <div className="h-full flex flex-col animate-slide-up">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-200">
        <h2 className="text-3xl font-serif">Past Encounters</h2>
        <button onClick={onBack} className="text-stone-400 hover:text-ink transition-colors">
          <XIcon className="w-8 h-8" />
        </button>
      </div>
      
      <div className="flex-grow overflow-y-auto space-y-4 pr-2">
        {loading ? (
          <div className="text-center text-stone-400 font-body italic text-xl mt-20">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center text-stone-400 font-body italic text-xl mt-20">
            No entries yet. Begin your first journey.
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="p-6 bg-white/50 border border-stone-100 rounded-sm hover:border-gold/30 transition-colors cursor-default">
              <div className="flex justify-between items-start mb-2">
                <div className="text-base font-bold text-gold font-serif">
                  {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
              
              {entry.declaration && (
                 <div className="mb-3 pb-3 border-b border-stone-100">
                    <p className="font-serif text-lg text-ink italic">&quot;My Father is {entry.declaration.truth}&quot;</p>
                 </div>
              )}

              <div className="text-stone-600 font-body text-lg line-clamp-3">
                {entry.steps.find(s => s.stepId === 6)?.answer || "Journal Entry"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Main App Component
export default function Home() {
  const { user, isLoaded } = useUser();
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<StepAnswer[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [declaration, setDeclaration] = useState<{ lie: string, truth: string } | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [isInTrial, setIsInTrial] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  // Check if returning from payment on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    if (paymentStatus === 'success') {
      setIsProcessingPayment(true);
      console.log('🔄 Detected payment return - setting processing state');
    }
  }, []);

  useEffect(() => {
    const handlePaymentReturn = async () => {
      if (!isLoaded) return;
      
      // Check for payment success in URL FIRST (before anything else)
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const sessionId = urlParams.get('session_id');

      console.log('=== useEffect running ===');
      console.log('isLoaded:', isLoaded);
      console.log('user:', user?.id);
      console.log('paymentStatus:', paymentStatus);
      console.log('sessionId:', sessionId);

      if (paymentStatus === 'success' && sessionId && user) {
        console.log('🎉 Payment success detected - verifying...');
        // Verify the payment session
        await verifyPaymentAndContinue(sessionId);
        return; // Don't run any other logic
      }
      
      if (paymentStatus === 'cancelled') {
        // Payment was cancelled - restore data and stay on journaling
        console.log('⚠️ Payment cancelled');
        const pendingDataStr = localStorage.getItem('pending_journal_data');
        console.log('Pending data in localStorage:', pendingDataStr);
        if (pendingDataStr && user) {
          const pendingData = JSON.parse(pendingDataStr);
          setAnswers(pendingData.answers);
          setCurrentStepIndex(IMMANUEL_STEPS.length - 1);
          setCurrentInput(pendingData.answers[pendingData.answers.length - 1]?.answer || '');
          setAppState(AppState.JOURNALING);
          localStorage.removeItem('pending_journal_data');
        }
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      if (user) {
        // Sync user data from Clerk to Supabase
        syncUserData();
        checkPaymentStatus();
      } else {
        // If not authenticated and in a journaling state, redirect to landing
        if (appState !== AppState.LANDING) {
          setAppState(AppState.LANDING);
        }
        setHasPaid(false);
      }
    };

    handlePaymentReturn();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user]);

  const syncUserData = async () => {
    if (!user) return;
    try {
      await fetch('/api/user/sync', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  };

  const checkPaymentStatus = async () => {
    console.log('=== checkPaymentStatus called ===');
    if (!user) {
      console.log('❌ No user - skipping payment check');
      return;
    }
    try {
      console.log('🔄 Fetching payment status for user:', user.id);
      const response = await fetch('/api/payment/status');
      console.log('📡 Payment status response:', response.status);
      const data = await response.json();
      console.log('📡 Payment status data:', data);
      
      // hasAccess means either paid or in trial
      setHasPaid(data.hasAccess || false);
      setIsInTrial(data.isInTrial || false);
      setTrialDaysRemaining(data.daysRemaining || 0);
      
      console.log('✅ Access status:', {
        hasAccess: data.hasAccess,
        isPaid: data.isPaid,
        isInTrial: data.isInTrial,
        daysRemaining: data.daysRemaining,
      });
      
      // Show trial notification if in trial
      if (data.isInTrial && data.daysRemaining > 0) {
        showToast(`Trial: ${data.daysRemaining} day${data.daysRemaining > 1 ? 's' : ''} remaining`, 'success');
      }
    } catch (error) {
      console.error('❌ Error checking payment status:', error);
    }
  };

  const verifyPaymentAndContinue = async (sessionId: string) => {
    console.log('=== verifyPaymentAndContinue called ===');
    console.log('Session ID:', sessionId);
    
    // First, check localStorage BEFORE making any API calls
    const pendingDataStr = localStorage.getItem('pending_journal_data');
    console.log('📦 Pending journal data in localStorage:', pendingDataStr ? 'FOUND' : 'NOT FOUND');
    if (pendingDataStr) {
      console.log('📦 Data:', pendingDataStr);
    }
    
    if (!user) {
      console.log('❌ No user - waiting...');
      return;
    }
    
    try {
      console.log('🔄 Verifying payment session with API...');
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await response.json();
      console.log('📡 Verify response:', data);
      
      if (data.verified) {
        console.log('✅ Payment verified!');
        setHasPaid(true);
        
        // Check if there's pending journal data (new flow - payment before declaration)
        if (pendingDataStr) {
          console.log('📝 Found pending journal data - continuing to declaration');
          try {
            const pendingData = JSON.parse(pendingDataStr);
            console.log('📝 Parsed answers:', pendingData.answers?.length, 'answers');
            
            // Set answers first
            setAnswers(pendingData.answers);
            
            // Remove from localStorage
            localStorage.removeItem('pending_journal_data');
            console.log('🗑️ Removed pending_journal_data from localStorage');
            
            // Clean up URL
            window.history.replaceState({}, '', window.location.pathname);
            console.log('🧹 Cleaned up URL');
            
            // Proceed to declaration
            console.log('🚀 Setting app state to DECLARATION');
            setAppState(AppState.DECLARATION);
            setIsProcessingPayment(false);
            
            console.log('✅ Should now show Declaration screen');
            return;
          } catch (parseError) {
            console.error('❌ Error parsing pending data:', parseError);
          }
        } else {
          console.log('⚠️ No pending_journal_data found in localStorage');
        }
        
        // Legacy: Check if there's a pending entry (old flow - payment at save)
        const pendingEntryStr = localStorage.getItem('pending_entry');
        if (pendingEntryStr) {
          try {
            const pendingEntry = JSON.parse(pendingEntryStr);
            console.log('Saving pending entry after payment:', pendingEntry);
            
            // Save entry to Supabase
            await journalService.saveEntry(user.id, pendingEntry);
            
            // Remove from localStorage
            localStorage.removeItem('pending_entry');
            
            console.log('Entry saved successfully to Supabase');
            showToast('Payment successful! Your entry has been saved.', 'success');
          } catch (error) {
            console.error('Error saving pending entry:', error);
            showToast('Payment successful, but failed to save entry. Please contact support.', 'error');
          }
        }
        
        // Clean up URL and return to landing (only if no pending data was found)
        console.log('⚠️ No pending data found - going to landing');
        window.history.replaceState({}, '', window.location.pathname);
        setAppState(AppState.LANDING);
        setIsProcessingPayment(false);
      } else {
        console.log('❌ Payment not verified');
        showToast('Payment verification failed. Please try again.', 'error');
        window.history.replaceState({}, '', window.location.pathname);
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      showToast('Error verifying payment. Please contact support.', 'error');
      window.history.replaceState({}, '', window.location.pathname);
      setIsProcessingPayment(false);
    }
  };

  const startJournaling = () => {
    // Require authentication before starting
    if (!user) {
      window.location.href = '/sign-in';
      return;
    }
    setAppState(AppState.JOURNALING);
    setCurrentStepIndex(0);
    setAnswers([]);
    setDeclaration(null);
    setCurrentInput("");
  };

  const handleNextStep = async () => {
    const newAnswer: StepAnswer = {
      stepId: IMMANUEL_STEPS[currentStepIndex].id,
      prompt: IMMANUEL_STEPS[currentStepIndex].primaryPrompt,
      answer: currentInput
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentStepIndex < IMMANUEL_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setCurrentInput(""); 
    } else {
      // Last step - check payment before proceeding to declaration
      console.log('=== Last step finished - checking payment ===');
      console.log('User:', user?.id);
      console.log('Has Paid:', hasPaid);

      if (!hasPaid) {
        console.log('💳 User has NOT paid and trial expired - initiating payment flow');
        
        // Show message about trial expiration if applicable
        if (isInTrial) {
          showToast('Your trial has ended. Please complete payment to continue.', 'error');
        }
        
        // Store answers in localStorage before redirecting to payment
        const pendingData = {
          answers: newAnswers,
          returnTo: 'declaration'
        };
        const dataToStore = JSON.stringify(pendingData);
        localStorage.setItem('pending_journal_data', dataToStore);
        console.log('💾 Journal data saved to localStorage');
        console.log('💾 Data stored:', dataToStore);
        
        // Verify it was saved
        const verifyData = localStorage.getItem('pending_journal_data');
        console.log('💾 Verified localStorage:', verifyData ? 'SUCCESS' : 'FAILED');
        
        // Create checkout session
        console.log('🔄 Creating checkout session...');
        try {
          const response = await fetch('/api/payment/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          console.log('📡 Checkout response status:', response.status);
          const data = await response.json();
          console.log('📡 Checkout response data:', data);

          if (data.url) {
            console.log('✅ Redirecting to Stripe:', data.url);
            window.location.href = data.url;
            return;
          } else {
            console.log('❌ No checkout URL received');
            localStorage.removeItem('pending_journal_data');
            showToast('Failed to create checkout session. Please try again.', 'error');
            return;
          }
        } catch (error) {
          console.error('❌ Error creating checkout:', error);
          localStorage.removeItem('pending_journal_data');
          showToast('Failed to create checkout. Please try again.', 'error');
          return;
        }
      }

      // User has paid, proceed to declaration
      console.log('✅ User has paid - proceeding to declaration');
      setAppState(AppState.DECLARATION);
    }
  };

  const handleDeclarationComplete = (result: { lie: string; truth: string }) => {
    setDeclaration(result);
    setAppState(AppState.SUMMARY);
  };

  const saveAndExit = async () => {
    console.log('=== saveAndExit called ===');
    console.log('User:', user?.id);
    console.log('Answers:', answers);
    console.log('Declaration:', declaration);

    // Require authentication to save
    if (!user) {
      console.log('❌ No user - redirecting to sign-in');
      showToast('You must be signed in to save entries.', 'error');
      setTimeout(() => {
        window.location.href = '/sign-in';
      }, 1500);
      return;
    }

    try {
      const newEntry: Omit<JournalEntry, 'id' | 'userId'> = {
        date: new Date().toISOString(),
        steps: answers,
        declaration: declaration || undefined
      };
      console.log('📝 New entry created:', newEntry);

      // User has already paid (payment happens before declaration), save directly to Supabase
      console.log('🔄 Saving to Supabase...');
      const savedEntry = await journalService.saveEntry(user.id, newEntry);
      console.log('✅ Entry saved successfully:', savedEntry);
      
      showToast('Your journal entry has been saved. Peace be with you.', 'success');
      setTimeout(() => {
        setAppState(AppState.LANDING);
      }, 1500);
    } catch (error) {
      console.error('❌ Error saving entry:', error);
      showToast('Failed to save entry. Please try again.', 'error');
    }
  };

  // Show loading screen while processing payment return
  if (isProcessingPayment || !isLoaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F0EBE5]">
        <div className="text-center">
          <SparklesIcon className="w-12 h-12 text-gold animate-pulse mx-auto mb-4" />
          <p className="text-xl font-serif text-stone-600">
            {isProcessingPayment ? 'Completing your payment...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F0EBE5] p-4 md:p-8 relative">
      {/* Authentication Status - Top Right */}
      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
        {user ? (
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 ring-2 ring-stone-200 hover:ring-gold transition-all",
              }
            }}
          />
        ) : (
          <SignInButton mode="redirect">
            <button className="px-4 py-2 bg-ink text-paper font-serif text-sm rounded-sm hover:bg-stone-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sign In
            </button>
          </SignInButton>
        )}
      </div>

      <PaperContainer className="h-[90vh]">
        {appState === AppState.LANDING && (
          <LandingScreen 
            onStart={startJournaling} 
            onArchive={() => setAppState(AppState.ARCHIVE)}
            isAuthenticated={!!user}
            hasPaid={hasPaid}
          />
        )}

        {appState === AppState.JOURNALING && (
          !user ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-xl text-stone-600 mb-4">Please sign in to continue</p>
                <button 
                  onClick={() => window.location.href = '/sign-in'}
                  className="px-6 py-2 bg-ink text-paper rounded-sm"
                >
                  Sign In
                </button>
              </div>
            </div>
          ) : (
            <JournalStepScreen
              stepIndex={currentStepIndex}
              totalSteps={IMMANUEL_STEPS.length}
              answer={currentInput}
              setAnswer={setCurrentInput}
              onNext={handleNextStep}
              previousAnswers={answers}
            />
          )
        )}

        {appState === AppState.DECLARATION && (
          !user ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-xl text-stone-600 mb-4">Please sign in to continue</p>
                <button 
                  onClick={() => window.location.href = '/sign-in'}
                  className="px-6 py-2 bg-ink text-paper rounded-sm"
                >
                  Sign In
                </button>
              </div>
            </div>
          ) : (
            <DeclarationScreen 
              answers={answers} 
              onComplete={handleDeclarationComplete} 
            />
          )
        )}

        {appState === AppState.SUMMARY && (
          !user ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-xl text-stone-600 mb-4">Please sign in to continue</p>
                <button 
                  onClick={() => window.location.href = '/sign-in'}
                  className="px-6 py-2 bg-ink text-paper rounded-sm"
                >
                  Sign In
                </button>
              </div>
            </div>
          ) : (
            <SummaryScreen 
              answers={answers}
              declaration={declaration} 
              onSave={saveAndExit}
              onNew={startJournaling}
            />
          )
        )}

        {appState === AppState.ARCHIVE && (
          <ArchiveScreen 
            onBack={() => setAppState(AppState.LANDING)}
            isAuthenticated={!!user}
            userId={user?.id}
          />
        )}
      </PaperContainer>
      <SoundPlayer />
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}


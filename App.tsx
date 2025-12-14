import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, StepAnswer, JournalEntry } from './types';
import { IMMANUEL_STEPS } from './constants';
import { PaperContainer } from './components/PaperContainer';
import { FeatherIcon, SparklesIcon, ChevronRightIcon, BookIcon, XIcon } from './components/Icons';
import { generateGentleNudge, generateBlessing, generateScriptureDeclaration } from './services/geminiService';

// --- Sub-components defined outside to avoid re-renders ---

const LandingScreen: React.FC<{ onStart: () => void; onArchive: () => void }> = ({ onStart, onArchive }) => (
  <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
    <div className="space-y-4">
      <div className="w-16 h-16 mx-auto bg-stone-100 rounded-full flex items-center justify-center border border-stone-200">
        <FeatherIcon className="w-8 h-8 text-gold" />
      </div>
      <h1 className="text-5xl md:text-6xl font-serif text-ink tracking-tight">Sabbath</h1>
      <p className="text-lg md:text-xl font-body text-stone-500 italic max-w-md mx-auto">
        "I see you. I hear you. I am with you."
      </p>
    </div>
    <div className="flex flex-col gap-4 pt-8">
      <button 
        onClick={onStart}
        className="group relative px-10 py-4 bg-ink text-paper font-serif text-xl rounded-sm overflow-hidden transition-all hover:bg-stone-800 shadow-lg hover:shadow-xl"
      >
        <span className="relative z-10 flex items-center gap-2">
          Begin Journaling <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </span>
      </button>
      <button 
        onClick={onArchive}
        className="text-stone-500 hover:text-gold font-body transition-colors flex items-center justify-center gap-2"
      >
        <BookIcon className="w-4 h-4" /> View Past Entries
      </button>
    </div>
  </div>
);

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

  // Clear nudge when step changes and reset scroll position
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
    const suggestion = await generateGentleNudge(step.id, previousAnswers);
    if (suggestion) {
      setNudgeText(suggestion);
    }
    setNudgeLoading(false);
  };

  return (
    <div className="flex flex-col h-full animate-slide-up">
      {/* Progress */}
      <div className="flex justify-between items-center mb-8 text-stone-400 font-serif text-sm tracking-widest uppercase">
        <span>Step {stepIndex + 1} of {totalSteps}</span>
        <span>{step.title}</span>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-grow flex flex-col space-y-6 overflow-y-auto">
        <div className="space-y-4">
          {/* Text Larger & More Readable: Breathing Cue */}
          <p className="text-gold font-serif italic text-3xl md:text-4xl leading-snug font-medium">
            {step.breathingCue}
          </p>
          
          {/* Main Title (Kept fine as requested, slightly cleaner spacing) */}
          <h2 className="text-4xl md:text-5xl font-serif text-ink leading-tight py-2">
            {step.primaryPrompt}
          </h2>
          
          {/* Text Larger & More Readable: Guidance */}
          <p className="text-stone-700 font-body text-2xl leading-relaxed font-light">
            {step.guidance}
          </p>

          {/* Example: Larger and more distinct */}
          <div className="mt-4 text-stone-500 font-body italic text-xl border-l-4 border-gold/30 pl-6 py-2">
             {step.example}
          </div>
          
          {/* Gemini Nudge */}
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
              "{nudgeText}"
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

      {/* Footer */}
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

  useEffect(() => {
    const generate = async () => {
      // Add a small artificial delay if generation is too fast, for effect
      const [result] = await Promise.all([
        generateScriptureDeclaration(answers),
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);
      
      setData(result);
      setLoading(false);
    };
    generate();
  }, [answers]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fade-in">
        <SparklesIcon className="w-12 h-12 text-gold animate-pulse mb-6" />
        <p className="text-2xl font-serif text-stone-500 italic">Waiting on the Lord...</p>
      </div>
    );
  }

  if (!data) {
    // Fallback if generation fails
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

  useEffect(() => {
    const fetchBlessing = async () => {
      const result = await generateBlessing(answers);
      setBlessing(result);
    };
    fetchBlessing();
  }, [answers]);

  return (
    <div className="h-full flex flex-col animate-fade-in overflow-y-auto pr-2">
      <div className="text-center mb-8">
        <div className="inline-block border-b-2 border-gold pb-2 mb-2">
          <h2 className="text-3xl font-serif text-ink">Letter from the Presence</h2>
        </div>
        <p className="text-stone-500 font-body italic">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="flex-grow space-y-8 font-body text-xl leading-relaxed text-ink/90">
        
        {/* Show Declaration if available */}
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
            <p className="font-serif text-2xl text-gold italic">"{blessing}"</p>
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

const ArchiveScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('immanuel_journal_archive');
    if (saved) {
      try {
        setEntries(JSON.parse(saved).reverse()); // Newest first
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <div className="h-full flex flex-col animate-slide-up">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-200">
        <h2 className="text-3xl font-serif">Past Encounters</h2>
        <button onClick={onBack} className="text-stone-400 hover:text-ink transition-colors">
          <XIcon className="w-8 h-8" />
        </button>
      </div>
      
      <div className="flex-grow overflow-y-auto space-y-4 pr-2">
        {entries.length === 0 ? (
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
                    <p className="font-serif text-lg text-ink italic">"My Father is {entry.declaration.truth}"</p>
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

// --- Main App Component ---

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<StepAnswer[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [declaration, setDeclaration] = useState<{ lie: string, truth: string } | null>(null);

  const startJournaling = () => {
    setAppState(AppState.JOURNALING);
    setCurrentStepIndex(0);
    setAnswers([]);
    setDeclaration(null);
    setCurrentInput("");
  };

  const handleNextStep = () => {
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
      // Go to Declaration step instead of immediate summary
      setAppState(AppState.DECLARATION);
    }
  };

  const handleDeclarationComplete = (result: { lie: string; truth: string }) => {
    setDeclaration(result);
    setAppState(AppState.SUMMARY);
  };

  const saveAndExit = () => {
    // Persist to local storage
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      userId: 'local', // Local storage user
      date: new Date().toISOString(),
      steps: answers,
      declaration: declaration || undefined
    };

    const existing = localStorage.getItem('immanuel_journal_archive');
    const archive = existing ? JSON.parse(existing) : [];
    archive.push(newEntry);
    localStorage.setItem('immanuel_journal_archive', JSON.stringify(archive));

    setAppState(AppState.LANDING);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F0EBE5] p-4 md:p-8 relative">
      
      <PaperContainer className="h-[90vh]">
        {appState === AppState.LANDING && (
          <LandingScreen 
            onStart={startJournaling} 
            onArchive={() => setAppState(AppState.ARCHIVE)} 
          />
        )}

        {appState === AppState.JOURNALING && (
          <JournalStepScreen
            stepIndex={currentStepIndex}
            totalSteps={IMMANUEL_STEPS.length}
            answer={currentInput}
            setAnswer={setCurrentInput}
            onNext={handleNextStep}
            previousAnswers={answers}
          />
        )}

        {appState === AppState.DECLARATION && (
          <DeclarationScreen 
            answers={answers} 
            onComplete={handleDeclarationComplete} 
          />
        )}

        {appState === AppState.SUMMARY && (
          <SummaryScreen 
            answers={answers}
            declaration={declaration} 
            onSave={saveAndExit}
            onNew={startJournaling}
          />
        )}

        {appState === AppState.ARCHIVE && (
          <ArchiveScreen onBack={() => setAppState(AppState.LANDING)} />
        )}
      </PaperContainer>
    </div>
  );
}
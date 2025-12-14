export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  steps: StepAnswer[];
  declaration?: {
    lie: string;
    truth: string;
  };
}

export interface StepAnswer {
  stepId: number;
  prompt: string;
  answer: string;
}

export interface JournalStep {
  id: number;
  title: string;
  primaryPrompt: string;
  breathingCue: string;
  guidance: string;
  placeholder: string;
  example: string;
}

export enum AppState {
  LANDING = 'LANDING',
  JOURNALING = 'JOURNALING',
  DECLARATION = 'DECLARATION',
  SUMMARY = 'SUMMARY',
  ARCHIVE = 'ARCHIVE',
}

export interface SoundscapeTrack {
  id: string;
  label: string;
  src: string;
}

import { JournalEntry } from '@/types';

const STORAGE_KEY = 'immanuel_journal_archive';

export const storageService = {
  saveEntry(entry: Omit<JournalEntry, 'id' | 'userId'>): JournalEntry {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      userId: 'local',
      date: entry.date,
      steps: entry.steps,
      declaration: entry.declaration,
    };

    const existing = localStorage.getItem(STORAGE_KEY);
    const archive = existing ? JSON.parse(existing) : [];
    archive.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(archive));

    return newEntry;
  },

  getEntries(): JournalEntry[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    
    try {
      return JSON.parse(saved).reverse(); // Newest first
    } catch (e) {
      console.error('Error parsing stored entries:', e);
      return [];
    }
  },

  getEntry(entryId: string): JournalEntry | null {
    const entries = this.getEntries();
    return entries.find(e => e.id === entryId) || null;
  },
};








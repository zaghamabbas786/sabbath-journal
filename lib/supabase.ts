import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { JournalEntry } from '@/types';

export interface User {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  has_paid: boolean;
  created_at: string;
  updated_at: string;
}

let supabaseClient: SupabaseClient | null = null;

const getSupabaseClient = (): SupabaseClient => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('🔧 Supabase URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.log('🔧 Supabase Anon Key:', supabaseAnonKey ? 'SET' : 'MISSING');

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
};

// User operations
export const userService = {
  async createOrUpdateUser(
    userId: string,
    userData: { name?: string; email?: string; hasPaid?: boolean }
  ): Promise<User> {
    console.log('=== userService.createOrUpdateUser called ===');
    console.log('User ID:', userId);
    console.log('User Data:', userData);
    
    const supabase = getSupabaseClient();
    
    // Check if user exists
    console.log('🔄 Checking if user exists...');
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    console.log('Existing user:', existingUser);
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching user:', fetchError);
    }

    if (existingUser) {
      // Update existing user
      console.log('🔄 Updating existing user...');
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          name: userData.name ?? existingUser.name,
          email: userData.email ?? existingUser.email,
          has_paid: userData.hasPaid ?? existingUser.has_paid,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating user:', error);
        throw error;
      }
      console.log('✅ User updated:', updatedUser);
      return updatedUser as User;
    } else {
      // Create new user
      console.log('🔄 Creating new user...');
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          user_id: userId,
          name: userData.name ?? null,
          email: userData.email ?? null,
          has_paid: userData.hasPaid ?? false,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating user:', error);
        throw error;
      }
      console.log('✅ User created:', newUser);
      return newUser as User;
    }
  },

  async getUser(userId: string): Promise<User | null> {
    console.log('=== userService.getUser called ===');
    console.log('User ID:', userId);
    
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️ User not found in DB');
        return null;
      }
      console.error('❌ Error fetching user:', error);
      throw error;
    }
    console.log('✅ User found:', data);
    return data as User;
  },

  async updatePaymentStatus(userId: string, hasPaid: boolean): Promise<User> {
    console.log('=== userService.updatePaymentStatus called ===');
    console.log('User ID:', userId);
    console.log('Has Paid:', hasPaid);
    
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .update({
        has_paid: hasPaid,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating payment status:', error);
      throw error;
    }
    console.log('✅ Payment status updated:', data);
    return data as User;
  },

  /**
   * Check if user is in trial period
   * @param user - User object from database
   * @returns true if user is in trial period, false otherwise
   */
  isInTrialPeriod(user: User): boolean {
    const trialPeriodDays = parseInt(process.env.NEXT_PUBLIC_TRIAL_PERIOD_DAYS || '0', 10);
    
    // If trial period is 0, no trial
    if (trialPeriodDays === 0) {
      console.log('⚠️ Trial period is disabled (TRIAL_PERIOD_DAYS = 0)');
      return false;
    }

    // If user has already paid, they're not in trial
    if (user.has_paid) {
      console.log('✅ User has already paid');
      return false;
    }

    const createdAt = new Date(user.created_at);
    const now = new Date();
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    console.log('📅 User created:', createdAt.toISOString());
    console.log('📅 Days since creation:', daysSinceCreation.toFixed(2));
    console.log('📅 Trial period days:', trialPeriodDays);

    const isInTrial = daysSinceCreation < trialPeriodDays;
    console.log(isInTrial ? '✅ User is in trial period' : '❌ Trial period expired');
    
    return isInTrial;
  },

  /**
   * Check if user has access (either paid or in trial)
   * @param userId - User ID from Clerk
   * @returns Object with hasAccess, hasPaid, isInTrial, and daysRemaining
   */
  async checkUserAccess(userId: string): Promise<{
    hasAccess: boolean;
    hasPaid: boolean;
    isInTrial: boolean;
    daysRemaining: number;
  }> {
    console.log('=== userService.checkUserAccess called ===');
    console.log('User ID:', userId);

    const user = await this.getUser(userId);
    
    if (!user) {
      console.log(' User not found');
      return {
        hasAccess: false,
        hasPaid: false,
        isInTrial: false,
        daysRemaining: 0,
      };
    }

    const hasPaid = user.has_paid;
    const isInTrial = this.isInTrialPeriod(user);
    const hasAccess = hasPaid || isInTrial;

    // Calculate days remaining in trial
    let daysRemaining = 0;
    if (isInTrial) {
      const trialPeriodDays = parseInt(process.env.NEXT_PUBLIC_TRIAL_PERIOD_DAYS || '0', 10);
      const createdAt = new Date(user.created_at);
      const now = new Date();
      const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      daysRemaining = Math.max(0, Math.ceil(trialPeriodDays - daysSinceCreation));
    }

    console.log('✅ Access check result:', { hasAccess, hasPaid, isInTrial, daysRemaining });

    return {
      hasAccess,
      hasPaid,
      isInTrial,
      daysRemaining,
    };
  },
};

// Database operations
export const journalService = {
  async saveEntry(userId: string, entry: Omit<JournalEntry, 'id' | 'userId'>): Promise<JournalEntry> {
    console.log('=== journalService.saveEntry called ===');
    console.log('User ID:', userId);
    console.log('Entry:', entry);
    
    const supabase = getSupabaseClient();
    console.log('🔄 Inserting entry into journal_entries...');
    
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        date: entry.date,
        steps: entry.steps,
        declaration: entry.declaration || null,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      throw error;
    }
    
    console.log('✅ Entry saved to DB:', data);
    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      steps: data.steps,
      declaration: data.declaration,
    };
  },

  async getEntries(userId: string): Promise<JournalEntry[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data.map((entry) => ({
      id: entry.id,
      userId: entry.user_id,
      date: entry.date,
      steps: entry.steps,
      declaration: entry.declaration,
    }));
  },

  async getEntry(userId: string, entryId: string): Promise<JournalEntry | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', entryId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      steps: data.steps,
      declaration: data.declaration,
    };
  },
};


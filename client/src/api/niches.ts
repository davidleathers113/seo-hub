import { supabase } from '../lib/supabase';
import type { Niche } from '../types/niche';

// Get all niches for the current user
export const getNiches = async (retries = 3) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const { data, error } = await supabase
        .from('niches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data };
    } catch (error) {
      attempt++;
      if (attempt === retries) throw error;
      // Wait for 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Failed to fetch niches after multiple attempts');
};

// Create a new niche
export const createNiche = async (name: string) => {
  // Get the current session and user
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  if (!session?.user) {
    throw new Error('Please sign in to create a niche');
  }

  const { data, error } = await supabase
    .from('niches')
    .insert([{
      name,
      user_id: session.user.id,
      pillars: [],
      progress: 0,
      status: 'pending'
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating niche:', error);
    throw new Error(error.message);
  }

  return { data };
};

// Get a specific niche
export const getNiche = async (id: string) => {
  const { data, error } = await supabase
    .from('niches')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return { data };
};

// Update a niche
export const updateNiche = async (id: string, updates: Partial<Niche>) => {
  const { data, error } = await supabase
    .from('niches')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return { data };
};

// Delete a niche
export const deleteNiche = async (id: string) => {
  const { error } = await supabase
    .from('niches')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// Generate pillars for a niche
export const generatePillars = async (nicheId: string) => {
  const { data, error } = await supabase
    .from('niches')
    .select('*')
    .eq('id', nicheId)
    .single();

  if (error) throw error;
  return { data };
};

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types for our database schema
export type Profile = {
  id: string;
  created_at: string;
  email: string;
  name: string | null;
};

export type Category = {
  id: string;
  created_at: string;
  name: string;
  color: string;
  type: 'income' | 'expense';
  user_id: string;
};

export type Transaction = {
  id: string;
  created_at: string;
  amount: number;
  description?: string;
  date: string;
  category_id: string;
  user_id: string;
  type: 'income' | 'expense';
};

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Authentication helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

// Database helpers
export const fetchCategories = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('app_0dbd55f360_categories')
    .select('*')
    .eq('user_id', user.user.id)
    .order('name');
  
  return { data, error };
};

export const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'user_id'>) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('app_0dbd55f360_categories')
    .insert([{ ...category, user_id: user.user.id }])
    .select()
    .single();
  
  return { data, error };
};

export const updateCategory = async (id: string, category: Partial<Omit<Category, 'id' | 'created_at' | 'user_id'>>) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('app_0dbd55f360_categories')
    .update(category)
    .eq('id', id)
    .eq('user_id', user.user.id)
    .select()
    .single();
  
  return { data, error };
};

export const deleteCategory = async (id: string) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: new Error('Not authenticated') };

  const { error } = await supabase
    .from('app_0dbd55f360_categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.user.id);
  
  return { error };
};

export const fetchTransactions = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('app_0dbd55f360_transactions')
    .select('*')
    .eq('user_id', user.user.id)
    .order('date', { ascending: false });
  
  return { data, error };
};

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('app_0dbd55f360_transactions')
    .insert([{ ...transaction, user_id: user.user.id }])
    .select()
    .single();
  
  return { data, error };
};

export const updateTransaction = async (id: string, transaction: Partial<Omit<Transaction, 'id' | 'created_at' | 'user_id'>>) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('app_0dbd55f360_transactions')
    .update(transaction)
    .eq('id', id)
    .eq('user_id', user.user.id)
    .select()
    .single();
  
  return { data, error };
};

export const deleteTransaction = async (id: string) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: new Error('Not authenticated') };

  const { error } = await supabase
    .from('app_0dbd55f360_transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.user.id);
  
  return { error };
};
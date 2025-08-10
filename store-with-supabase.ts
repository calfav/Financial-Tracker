import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import * as supabaseClient from './supabase';
import { Category as SupabaseCategory, Transaction as SupabaseTransaction } from './supabase';

export type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  amount: number;
  description?: string;
  date: string;
  category_id: string;
  type: 'income' | 'expense';
  created_at: string;
};

export type FinanceStore = {
  categories: Category[];
  transactions: Transaction[];
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: any | null;
  init: () => Promise<void>;
  sync: () => Promise<void>;
  login: (email: string, password: string) => Promise<{success: boolean; error?: any}>;
  register: (email: string, password: string) => Promise<{success: boolean; error?: any}>;
  logout: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<string>;
  updateCategory: (id: string, category: Partial<Omit<Category, 'id' | 'created_at'>>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<string>;
  updateTransaction: (id: string, transaction: Partial<Omit<Transaction, 'id' | 'created_at'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
};

const defaultCategories: Omit<Category, 'id' | 'created_at'>[] = [
  { name: 'Salary', type: 'income', color: '#10b981' }, // Green
  { name: 'Investment', type: 'income', color: '#3b82f6' }, // Blue
  { name: 'Food', type: 'expense', color: '#ef4444' }, // Red
  { name: 'Transport', type: 'expense', color: '#f59e0b' }, // Amber
  { name: 'Bills', type: 'expense', color: '#8b5cf6' }, // Violet
  { name: 'Shopping', type: 'expense', color: '#ec4899' }, // Pink
  { name: 'Health', type: 'expense', color: '#06b6d4' }, // Cyan
  { name: 'Entertainment', type: 'expense', color: '#f97316' }, // Orange
  { name: 'Education', type: 'expense', color: '#6366f1' }, // Indigo
  { name: 'Other', type: 'expense', color: '#71717a' }, // Zinc
];

// Convert Supabase types to our local types
const mapSupabaseCategory = (category: SupabaseCategory): Category => ({
  id: category.id,
  name: category.name,
  type: category.type,
  color: category.color,
  created_at: category.created_at,
});

const mapSupabaseTransaction = (transaction: SupabaseTransaction): Transaction => ({
  id: transaction.id,
  amount: transaction.amount,
  description: transaction.description,
  date: transaction.date,
  category_id: transaction.category_id,
  type: transaction.type,
  created_at: transaction.created_at,
});

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      categories: defaultCategories.map(cat => ({
        ...cat,
        id: uuidv4(),
        created_at: new Date().toISOString(),
      })),
      transactions: [],
      isLoading: false,
      isInitialized: false,
      isAuthenticated: false,
      user: null,
      
      init: async () => {
        set({ isLoading: true });
        
        try {
          // Check if user is logged in
          const { user, error } = await supabaseClient.getCurrentUser();
          
          if (user) {
            set({ isAuthenticated: true, user });
            
            // Fetch data from Supabase
            await get().sync();
          }
        } catch (error) {
          console.error('Error initializing store:', error);
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },
      
      sync: async () => {
        set({ isLoading: true });
        
        try {
          // Fetch categories
          const { data: categoriesData, error: categoriesError } = await supabaseClient.fetchCategories();
          
          if (categoriesError) {
            throw categoriesError;
          }
          
          if (categoriesData && Array.isArray(categoriesData)) {
            // If user has no categories yet, create default ones in Supabase
            if (categoriesData.length === 0) {
              const newCategories: Category[] = [];
              
              for (const defaultCat of defaultCategories) {
                const { data, error } = await supabaseClient.createCategory(defaultCat);
                if (!error && data) {
                  newCategories.push(mapSupabaseCategory(data));
                }
              }
              
              set({ categories: newCategories });
            } else {
              set({ 
                categories: categoriesData.map(mapSupabaseCategory)
              });
            }
          }
          
          // Fetch transactions
          const { data: transactionsData, error: transactionsError } = await supabaseClient.fetchTransactions();
          
          if (transactionsError) {
            throw transactionsError;
          }
          
          if (transactionsData && Array.isArray(transactionsData)) {
            set({ 
              transactions: transactionsData.map(mapSupabaseTransaction)
            });
          }
        } catch (error) {
          console.error('Error syncing with Supabase:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      login: async (email, password) => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabaseClient.signIn(email, password);
          
          if (error) {
            return { success: false, error };
          }
          
          set({ 
            isAuthenticated: true, 
            user: data.user 
          });
          
          // Fetch user data
          await get().sync();
          
          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          return { success: false, error };
        } finally {
          set({ isLoading: false });
        }
      },
      
      register: async (email, password) => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabaseClient.signUp(email, password);
          
          if (error) {
            return { success: false, error };
          }
          
          // Note: Supabase sends a confirmation email by default
          // We'll consider the user authenticated if sign up was successful
          if (data && data.user) {
            set({ 
              isAuthenticated: true, 
              user: data.user 
            });
            
            // Create default categories for new user
            const newCategories: Category[] = [];
            for (const defaultCat of defaultCategories) {
              const { data, error } = await supabaseClient.createCategory(defaultCat);
              if (!error && data) {
                newCategories.push(mapSupabaseCategory(data));
              }
            }
            
            set({ categories: newCategories });
          }
          
          return { success: true };
        } catch (error) {
          console.error('Registration error:', error);
          return { success: false, error };
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        
        try {
          const { error } = await supabaseClient.signOut();
          
          if (error) {
            throw error;
          }
          
          set({
            isAuthenticated: false,
            user: null,
            // Reset to default state
            categories: defaultCategories.map(cat => ({
              ...cat,
              id: uuidv4(),
              created_at: new Date().toISOString(),
            })),
            transactions: []
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      addCategory: async (category) => {
        const newCategory = { 
          ...category
        };
        
        if (get().isAuthenticated) {
          try {
            const { data, error } = await supabaseClient.createCategory(newCategory);
            
            if (error) {
              throw error;
            }
            
            if (data) {
              const mappedCategory = mapSupabaseCategory(data);
              
              set((state) => ({
                categories: [...state.categories, mappedCategory]
              }));
              
              return mappedCategory.id;
            }
          } catch (error) {
            console.error('Error adding category:', error);
          }
        } else {
          // Fallback to local storage
          const id = uuidv4();
          set((state) => ({
            categories: [
              ...state.categories, 
              { 
                ...newCategory, 
                id, 
                created_at: new Date().toISOString() 
              }
            ]
          }));
          return id;
        }
        
        return '';
      },
      
      updateCategory: async (id, category) => {
        if (get().isAuthenticated) {
          try {
            const { error } = await supabaseClient.updateCategory(id, category);
            
            if (error) {
              throw error;
            }
            
            set((state) => ({
              categories: state.categories.map((c) => 
                c.id === id ? { ...c, ...category } : c
              )
            }));
          } catch (error) {
            console.error('Error updating category:', error);
          }
        } else {
          // Fallback to local storage
          set((state) => ({
            categories: state.categories.map((c) => 
              c.id === id ? { ...c, ...category } : c
            )
          }));
        }
      },
      
      deleteCategory: async (id) => {
        if (get().isAuthenticated) {
          try {
            const { error } = await supabaseClient.deleteCategory(id);
            
            if (error) {
              throw error;
            }
            
            set((state) => ({
              categories: state.categories.filter((c) => c.id !== id),
              // Also remove transactions with this category
              transactions: state.transactions.filter((t) => t.category_id !== id)
            }));
          } catch (error) {
            console.error('Error deleting category:', error);
          }
        } else {
          // Fallback to local storage
          set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
            transactions: state.transactions.filter((t) => t.category_id !== id)
          }));
        }
      },
      
      addTransaction: async (transaction) => {
        const newTransaction = { 
          ...transaction
        };
        
        if (get().isAuthenticated) {
          try {
            const { data, error } = await supabaseClient.createTransaction(newTransaction);
            
            if (error) {
              throw error;
            }
            
            if (data) {
              const mappedTransaction = mapSupabaseTransaction(data);
              
              set((state) => ({
                transactions: [...state.transactions, mappedTransaction]
              }));
              
              return mappedTransaction.id;
            }
          } catch (error) {
            console.error('Error adding transaction:', error);
          }
        } else {
          // Fallback to local storage
          const id = uuidv4();
          set((state) => ({
            transactions: [
              ...state.transactions, 
              { 
                ...newTransaction, 
                id, 
                created_at: new Date().toISOString() 
              }
            ]
          }));
          return id;
        }
        
        return '';
      },
      
      updateTransaction: async (id, transaction) => {
        if (get().isAuthenticated) {
          try {
            const { error } = await supabaseClient.updateTransaction(id, transaction);
            
            if (error) {
              throw error;
            }
            
            set((state) => ({
              transactions: state.transactions.map((t) => 
                t.id === id ? { ...t, ...transaction } : t
              )
            }));
          } catch (error) {
            console.error('Error updating transaction:', error);
          }
        } else {
          // Fallback to local storage
          set((state) => ({
            transactions: state.transactions.map((t) => 
              t.id === id ? { ...t, ...transaction } : t
            )
          }));
        }
      },
      
      deleteTransaction: async (id) => {
        if (get().isAuthenticated) {
          try {
            const { error } = await supabaseClient.deleteTransaction(id);
            
            if (error) {
              throw error;
            }
            
            set((state) => ({
              transactions: state.transactions.filter((t) => t.id !== id)
            }));
          } catch (error) {
            console.error('Error deleting transaction:', error);
          }
        } else {
          // Fallback to local storage
          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id)
          }));
        }
      },
    }),
    {
      name: 'finance-store',
      // Only persist non-sensitive data when using localStorage
      partialize: (state) => ({
        categories: state.categories,
        transactions: state.transactions,
      }),
    }
  )
);

// Initialize the store when the app loads
if (typeof window !== 'undefined') {
  useFinanceStore.getState().init();
}
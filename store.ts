import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

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
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => string;
  updateCategory: (id: string, category: Partial<Omit<Category, 'id' | 'created_at'>>) => void;
  deleteCategory: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => string;
  updateTransaction: (id: string, transaction: Partial<Omit<Transaction, 'id' | 'created_at'>>) => void;
  deleteTransaction: (id: string) => void;
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

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      categories: defaultCategories.map(cat => ({
        ...cat,
        id: uuidv4(),
        created_at: new Date().toISOString(),
      })),
      transactions: [],
      
      addCategory: (category) => {
        const id = uuidv4();
        set((state) => ({
          categories: [
            ...state.categories, 
            { 
              ...category, 
              id, 
              created_at: new Date().toISOString() 
            }
          ]
        }));
        return id;
      },
      
      updateCategory: (id, category) => {
        set((state) => ({
          categories: state.categories.map((c) => 
            c.id === id ? { ...c, ...category } : c
          )
        }));
      },
      
      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          // Also remove all transactions with this category
          transactions: state.transactions.filter((t) => t.category_id !== id)
        }));
      },
      
      addTransaction: (transaction) => {
        const id = uuidv4();
        set((state) => ({
          transactions: [
            ...state.transactions, 
            { 
              ...transaction, 
              id, 
              created_at: new Date().toISOString() 
            }
          ]
        }));
        return id;
      },
      
      updateTransaction: (id, transaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) => 
            t.id === id ? { ...t, ...transaction } : t
          )
        }));
      },
      
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id)
        }));
      },
    }),
    {
      name: 'finance-store',
    }
  )
);
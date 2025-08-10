import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function groupTransactionsByMonth(transactions: any[]) {
  return transactions.reduce((acc: Record<string, any[]>, transaction) => {
    const date = new Date(transaction.date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    
    acc[monthYear].push(transaction);
    return acc;
  }, {});
}

export function getMonthYearString(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth(), year: now.getFullYear() };
}

export function getFilteredTransactions(transactions: any[], month: number, year: number) {
  return transactions.filter(transaction => {
    const date = new Date(transaction.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
}

// Calculate total income or expenses for given transactions
export function calculateTotal(transactions: any[], type: 'income' | 'expense') {
  return transactions
    .filter(t => t.type === type)
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

// Group transactions by category
export function groupByCategory(transactions: any[], categories: any[]) {
  const result: Record<string, { total: number; color: string; name: string }> = {};
  
  transactions.forEach(transaction => {
    const category = categories.find(c => c.id === transaction.category_id);
    if (category) {
      if (!result[category.id]) {
        result[category.id] = {
          total: 0,
          color: category.color,
          name: category.name,
        };
      }
      result[category.id].total += Number(transaction.amount);
    }
  });
  
  return Object.values(result).sort((a, b) => b.total - a.total);
}

export function getExpenseTrend(transactions: any[], months = 6) {
  const now = new Date();
  const result: { month: string; total: number }[] = [];
  
  for (let i = 0; i < months; i++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = targetDate.getMonth();
    const year = targetDate.getFullYear();
    
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === month && date.getFullYear() === year && t.type === 'expense';
    });
    
    const total = monthTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    
    result.unshift({
      month: targetDate.toLocaleDateString('en-US', { month: 'short' }),
      total,
    });
  }
  
  return result;
}

export function analyzeSpending(currentTransactions: any[], previousTransactions: any[], categories: any[]) {
  // Group current and previous month expenses by category
  const currentExpenses = currentTransactions.filter(t => t.type === 'expense');
  const previousExpenses = previousTransactions.filter(t => t.type === 'expense');
  
  // Get top spending categories
  const currentByCategory = groupByCategory(currentExpenses, categories);
  
  // Get previous month totals by category
  const previousByCategory = groupByCategory(previousExpenses, categories);
  const previousTotalByCategory: Record<string, number> = {};
  previousByCategory.forEach(item => {
    previousTotalByCategory[item.name] = item.total;
  });
  
  // Generate insights
  const insights: { category: string; amount: number; change: number; suggestion: string }[] = [];
  
  // Take top 3 expense categories
  const topCategories = currentByCategory.slice(0, 3);
  
  topCategories.forEach(category => {
    const previousAmount = previousTotalByCategory[category.name] || 0;
    const change = previousAmount ? ((category.total - previousAmount) / previousAmount) * 100 : 0;
    
    let suggestion = '';
    
    // Generate a suggestion based on the category and spending change
    if (category.name === 'Food' && change > 10) {
      suggestion = 'Consider meal prepping on weekends to reduce dining out expenses.';
    } else if (category.name === 'Food') {
      suggestion = 'Try cooking at home 3 nights a week to save on dining expenses.';
    } else if (category.name === 'Shopping' && change > 10) {
      suggestion = 'Your shopping expenses have increased. Consider creating a shopping list and sticking to it.';
    } else if (category.name === 'Shopping') {
      suggestion = 'Wait 24 hours before making non-essential purchases to avoid impulse buying.';
    } else if (category.name === 'Transport' && change > 10) {
      suggestion = 'Your transport costs are rising. Consider carpooling or public transit when possible.';
    } else if (category.name === 'Transport') {
      suggestion = 'Plan your trips efficiently to save on fuel costs.';
    } else if (category.name === 'Entertainment' && change > 10) {
      suggestion = 'Look for free or low-cost entertainment options in your area to reduce spending.';
    } else if (category.name === 'Entertainment') {
      suggestion = 'Consider sharing subscription services with family or friends to split costs.';
    } else if (change > 10) {
      suggestion = `Your ${category.name.toLowerCase()} spending has increased by ${Math.round(change)}% from last month. Consider setting a budget for this category.`;
    } else {
      suggestion = `Try to reduce ${category.name.toLowerCase()} expenses by finding cost-effective alternatives.`;
    }
    
    insights.push({
      category: category.name,
      amount: category.total,
      change,
      suggestion,
    });
  });
  
  return insights;
}
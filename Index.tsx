import { useState, useEffect } from "react";
import { useFinanceStore, Transaction, Category } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layouts/main-layout";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { AIAssistant } from "@/components/dashboard/ai-assistant";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { CategoryFormDialog } from "@/components/dashboard/category-form-dialog";
import { TransactionFormDialog } from "@/components/dashboard/transaction-form-dialog";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { DateRange } from "react-day-picker";
import { addMonths, subMonths, isWithinInterval } from "date-fns";
import { DownloadIcon, PlusIcon } from "lucide-react";
import { getCurrentMonthYear } from "@/lib/utils";

export default function Dashboard() {
  const { 
    transactions, 
    categories, 
    addTransaction, 
    deleteTransaction,
    updateTransaction,
    addCategory 
  } = useFinanceStore();
  
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { from, to };
  });

  // Filtered transactions based on date range
  const filteredTransactions = transactions.filter((transaction) => {
    if (!dateRange?.from) return true;
    
    const transactionDate = new Date(transaction.date);
    
    if (dateRange.to) {
      return isWithinInterval(transactionDate, {
        start: dateRange.from,
        end: dateRange.to,
      });
    }
    
    return (
      transactionDate.getDate() === dateRange.from.getDate() &&
      transactionDate.getMonth() === dateRange.from.getMonth() &&
      transactionDate.getFullYear() === dateRange.from.getFullYear()
    );
  });
  
  // Get previous period transactions for comparison
  const previousPeriodTransactions = (() => {
    if (!dateRange?.from) return [];
    
    const currentFrom = dateRange.from;
    const currentTo = dateRange.to || currentFrom;
    const duration = dateRange.to 
      ? dateRange.to.getTime() - dateRange.from.getTime() 
      : 0;
    
    const prevFrom = subMonths(currentFrom, 1);
    const prevTo = duration ? new Date(prevFrom.getTime() + duration) : undefined;
    
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      
      if (prevTo) {
        return isWithinInterval(transactionDate, {
          start: prevFrom,
          end: prevTo,
        });
      }
      
      return (
        transactionDate.getDate() === prevFrom.getDate() &&
        transactionDate.getMonth() === prevFrom.getMonth() &&
        transactionDate.getFullYear() === prevFrom.getFullYear()
      );
    });
  })();
  
  // Export transactions as CSV
  const exportToCSV = () => {
    // Create CSV headers
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const csvRows = [headers];
    
    // Add transaction data
    filteredTransactions.forEach(transaction => {
      const category = categories.find(c => c.id === transaction.category_id);
      const row = [
        transaction.date,
        transaction.type,
        category?.name || 'Unknown',
        transaction.description || '',
        transaction.amount
      ];
      csvRows.push(row);
    });
    
    // Convert to CSV string
    const csvContent = csvRows
      .map(row => row.map(cell => typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell).join(','))
      .join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `finance-report-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionDialogOpen(true);
  };
  
  const handleAddTransaction = (data: Omit<Transaction, "id" | "created_at">) => {
    addTransaction(data);
  };
  
  const handleUpdateTransaction = (data: Omit<Transaction, "id" | "created_at">) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data);
      setEditingTransaction(undefined);
    }
  };
  
  const handleTransactionSubmit = (data: Omit<Transaction, "id" | "created_at">) => {
    if (editingTransaction) {
      handleUpdateTransaction(data);
    } else {
      handleAddTransaction(data);
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Finance Dashboard</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCategoryDialogOpen(true)}
          >
            New Category
          </Button>
          <Button
            onClick={() => {
              setEditingTransaction(undefined);
              setTransactionDialogOpen(true);
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <DateRangePicker 
          dateRange={dateRange} 
          onDateRangeChange={setDateRange}
          className="w-full md:w-[300px]" 
        />
        
        <Button
          variant="outline"
          className="flex items-center"
          onClick={exportToCSV}
        >
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-8">
        <SummaryCards
          transactions={filteredTransactions}
          comparisonTransactions={previousPeriodTransactions}
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <ExpenseChart 
          transactions={filteredTransactions} 
          categories={categories}
          period="month"
        />
        <div className="md:col-span-1">
          <AIAssistant
            currentTransactions={filteredTransactions}
            previousTransactions={previousPeriodTransactions}
            categories={categories}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsTable
            transactions={filteredTransactions}
            categories={categories}
            onEdit={handleEditTransaction}
            onDelete={deleteTransaction}
          />
        </CardContent>
      </Card>
      
      <TransactionFormDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        onSubmit={handleTransactionSubmit}
        initialData={editingTransaction}
        categories={categories}
      />
      
      <CategoryFormDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSubmit={addCategory}
      />
    </MainLayout>
  );
}
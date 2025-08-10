import { useState } from "react";
import { useFinanceStore, Transaction } from "@/lib/store";
import { MainLayout } from "@/components/layouts/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { TransactionFormDialog } from "@/components/dashboard/transaction-form-dialog";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { DateRange } from "react-day-picker";
import { isWithinInterval } from "date-fns";
import { PlusIcon, DownloadIcon } from "lucide-react";

export default function Transactions() {
  const { 
    transactions, 
    categories, 
    addTransaction, 
    updateTransaction,
    deleteTransaction 
  } = useFinanceStore();
  
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
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
    link.setAttribute('download', `transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionDialogOpen(true);
  };
  
  const handleTransactionSubmit = (data: Omit<Transaction, "id" | "created_at">) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data);
      setEditingTransaction(undefined);
    } else {
      addTransaction(data);
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Transactions</h1>
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
      
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
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
    </MainLayout>
  );
}
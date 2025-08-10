import { ArrowDownIcon, ArrowUpIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, calculateTotal } from "@/lib/utils";
import { Transaction } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardsProps {
  transactions: Transaction[];
  comparisonTransactions?: Transaction[];
  isLoading?: boolean;
}

export function SummaryCards({ transactions, comparisonTransactions, isLoading = false }: SummaryCardsProps) {
  // Calculate totals
  const totalIncome = calculateTotal(transactions, 'income');
  const totalExpenses = calculateTotal(transactions, 'expense');
  const balance = totalIncome - totalExpenses;
  
  // Calculate comparison percentages if comparison data is provided
  const prevIncome = comparisonTransactions ? calculateTotal(comparisonTransactions, 'income') : 0;
  const prevExpenses = comparisonTransactions ? calculateTotal(comparisonTransactions, 'expense') : 0;
  const prevBalance = prevIncome - prevExpenses;
  
  const incomeChange = prevIncome ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0;
  const expenseChange = prevExpenses ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : 0;
  const balanceChange = prevBalance ? ((balance - prevBalance) / Math.abs(prevBalance)) * 100 : 0;
  
  return (
    <>
      <SummaryCard
        title="Total Income"
        value={totalIncome}
        icon={<ArrowDownIcon className="h-4 w-4 text-green-500" />}
        percentageChange={incomeChange}
        trend="up"
        isLoading={isLoading}
      />
      <SummaryCard
        title="Total Expenses"
        value={totalExpenses}
        icon={<ArrowUpIcon className="h-4 w-4 text-red-500" />}
        percentageChange={expenseChange}
        trend="down"
        isLoading={isLoading}
      />
      <SummaryCard
        title="Balance"
        value={balance}
        icon={<ArrowRightIcon className="h-4 w-4 text-blue-500" />}
        percentageChange={balanceChange}
        trend={balance >= prevBalance ? "up" : "down"}
        isLoading={isLoading}
      />
    </>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  percentageChange?: number;
  trend: "up" | "down";
  isLoading?: boolean;
}

function SummaryCard({ title, value, icon, percentageChange, trend, isLoading }: SummaryCardProps) {
  const showPercentage = percentageChange !== undefined && !isNaN(percentageChange) && isFinite(percentageChange);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-7 w-3/4 mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{formatCurrency(value)}</div>
            {showPercentage && (
              <p className={`text-xs ${
                trend === "up"
                  ? value > 0 ? "text-green-500" : "text-red-500"
                  : value > 0 ? "text-red-500" : "text-green-500"
              }`}>
                {percentageChange > 0 ? "+" : ""}
                {percentageChange.toFixed(1)}% from previous period
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Category, Transaction } from '@/lib/store';

interface ExpenseChartProps {
  transactions: Transaction[];
  categories: Category[];
  period: 'month' | 'year';
}

export function ExpenseChart({ transactions, categories, period }: ExpenseChartProps) {
  // Filter only expenses
  const expenses = transactions.filter(t => t.type === 'expense');
  
  // Group by category
  const categoryData = expenses.reduce((acc: Record<string, number>, transaction) => {
    const categoryId = transaction.category_id;
    if (!acc[categoryId]) {
      acc[categoryId] = 0;
    }
    acc[categoryId] += Number(transaction.amount);
    return acc;
  }, {});
  
  // Format data for charts
  const pieData = Object.entries(categoryData).map(([categoryId, amount]) => {
    const category = categories.find(c => c.id === categoryId);
    return {
      name: category?.name || 'Unknown',
      value: amount,
      color: category?.color || '#888888',
    };
  }).sort((a, b) => b.value - a.value);
  
  // Calculate monthly data for bar chart
  const monthlyData = React.useMemo(() => {
    const months: Record<string, Record<string, number>> = {};
    
    expenses.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!months[monthKey]) {
        months[monthKey] = {};
      }
      
      const category = categories.find(c => c.id === transaction.category_id);
      const categoryName = category?.name || 'Unknown';
      
      if (!months[monthKey][categoryName]) {
        months[monthKey][categoryName] = 0;
      }
      
      months[monthKey][categoryName] += Number(transaction.amount);
    });
    
    return Object.entries(months).map(([month, categories]) => ({
      month,
      ...categories,
    }));
  }, [expenses, categories]);
  
  // Get unique category names for bar chart
  const categoryNames = Array.from(
    new Set(pieData.map(item => item.name))
  );
  
  // Generate colors for bar chart
  const categoryColors = categoryNames.reduce((acc: Record<string, string>, name) => {
    const category = categories.find(c => c.name === name);
    acc[name] = category?.color || '#888888';
    return acc;
  }, {});

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Expense Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pie">
          <TabsList className="mb-4">
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pie">
            <div className="h-80">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => 
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                    <Legend formatter={(value) => value} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No expense data available.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="bar">
            <div className="h-80">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => 
                        value === 0 ? '0' : `${(value / 1000).toFixed(1)}k`
                      }
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Amount']}
                    />
                    <Legend />
                    {categoryNames.map((name) => (
                      <Bar 
                        key={name} 
                        dataKey={name} 
                        stackId="a" 
                        fill={categoryColors[name]} 
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No expense data available.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
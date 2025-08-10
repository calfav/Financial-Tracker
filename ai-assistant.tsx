import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeSpending } from "@/lib/utils";
import { Transaction, Category } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { BrainCircuit } from "lucide-react";

interface AIAssistantProps {
  currentTransactions: Transaction[];
  previousTransactions: Transaction[];
  categories: Category[];
}

export function AIAssistant({ 
  currentTransactions,
  previousTransactions,
  categories
}: AIAssistantProps) {
  const insights = React.useMemo(
    () => analyzeSpending(currentTransactions, previousTransactions, categories),
    [currentTransactions, previousTransactions, categories]
  );
  
  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <BrainCircuit className="w-5 h-5 mr-2 text-primary" />
            <CardTitle>AI Insights</CardTitle>
          </div>
          <CardDescription>
            Not enough data to generate insights yet. Add more transactions to see AI-powered recommendations.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <BrainCircuit className="w-5 h-5 mr-2 text-primary" />
          <CardTitle>AI Insights</CardTitle>
        </div>
        <CardDescription>
          Analysis of your top spending categories and personalized suggestions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Here are your top spending categories this period:
          </p>
          
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between">
                  <div className="font-medium">{index + 1}. {insight.category}</div>
                  <div className="font-semibold text-red-500">
                    {formatCurrency(insight.amount)}
                  </div>
                </div>
                
                {insight.change !== 0 && (
                  <p className="text-xs text-muted-foreground">
                    {insight.change > 0
                      ? `↑ ${Math.abs(Math.round(insight.change))}% increase from last period`
                      : `↓ ${Math.abs(Math.round(insight.change))}% decrease from last period`}
                  </p>
                )}
                
                <div className="bg-muted p-3 rounded-md text-sm mt-1">
                  <p>{insight.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
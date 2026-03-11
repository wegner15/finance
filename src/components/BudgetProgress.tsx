import React from 'react';
import { Progress } from './ui/progress';
import { cn } from '../lib/utils';

interface BudgetProgressProps {
  category: string;
  amount: number;
  spent: number;
  period: string;
  className?: string;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({
  category,
  amount,
  spent,
  period,
  className
}) => {
  const percentage = Math.min((spent / amount) * 100, 100);
  const isOverBudget = spent > amount;
  const remaining = Math.max(amount - spent, 0);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-end">
        <div>
          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">{category}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{period} Budget</p>
        </div>
        <div className="text-right">
          <span className={cn(
            "text-sm font-bold",
            isOverBudget ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"
          )}>
            KSh {spent.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            / KSh {amount.toLocaleString()}
          </span>
        </div>
      </div>
      
      <Progress 
        value={percentage} 
        className={cn(
          "h-2",
          isOverBudget ? "[&>div]:bg-red-500" : percentage > 80 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-primary"
        )} 
      />
      
      <div className="flex justify-between text-xs">
        <p className={cn(
          isOverBudget ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-500 dark:text-gray-400"
        )}>
          {isOverBudget 
            ? `Over by KSh ${(spent - amount).toLocaleString()}` 
            : `${percentage.toFixed(0)}% used`
          }
        </p>
        {!isOverBudget && (
          <p className="text-gray-500 dark:text-gray-400">
            KSh {remaining.toLocaleString()} left
          </p>
        )}
      </div>
    </div>
  );
};

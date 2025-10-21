 import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import TrendingDown from 'lucide-react/dist/esm/icons/trending-down';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Nav from '../components/Nav';

interface TransactionsProps {
  theme: string;
  path: string;
  transactions: any[];
}

const Transactions: React.FC<TransactionsProps> = ({ theme, path, transactions }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Nav theme={theme} path={path} />
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
            <a href="/transactions/new" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Add Transaction
            </a>
          </div>
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
              <CardTitle className="text-2xl flex items-center">
                <DollarSign className="w-6 h-6 mr-2" />
                All Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white dark:bg-gray-800">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Type</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Description</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Category</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Date</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow className="bg-white dark:bg-gray-800">
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-lg">
                        No transactions yet. Add your first transaction to track finances.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction, index) => (
                      <TableRow key={transaction.id} className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"}>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'income'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {transaction.type === 'income' ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {transaction.type}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-gray-900 dark:text-gray-100">{transaction.description || '-'}</TableCell>
                        <TableCell className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          KSH {transaction.amount ? transaction.amount.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{transaction.category}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{new Date(transaction.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</TableCell>
                        <TableCell>
                          <a href={`/transactions/${transaction.id}/edit`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1">
                            Edit
                          </a>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
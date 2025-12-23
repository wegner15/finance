import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import TrendingDown from 'lucide-react/dist/esm/icons/trending-down';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Search from 'lucide-react/dist/esm/icons/search';
import Filter from 'lucide-react/dist/esm/icons/filter';
import X from 'lucide-react/dist/esm/icons/x';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import ArrowUpCircle from 'lucide-react/dist/esm/icons/arrow-up-circle';
import ArrowDownCircle from 'lucide-react/dist/esm/icons/arrow-down-circle';
import Wallet from 'lucide-react/dist/esm/icons/wallet';
import Nav from '../components/Nav';
import { Link } from 'react-router-dom';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description: string;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions');
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        setTransactions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Derived State: Unique Categories
  const categories = useMemo(() => {
    const unique = new Set(transactions.map(t => t.category));
    return Array.from(unique).sort();
  }, [transactions]);

  // Derived State: Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

      let matchesDate = true;
      if (startDate && endDate) {
        matchesDate = t.date >= startDate && t.date <= endDate;
      } else if (startDate) {
        matchesDate = t.date >= startDate;
      } else if (endDate) {
        matchesDate = t.date <= endDate;
      }

      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });
  }, [transactions, searchTerm, typeFilter, categoryFilter, startDate, endDate]);

  // Derived State: Summary Stats
  const summaryStats = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      if (t.type === 'income') {
        acc.income += t.amount;
      } else {
        acc.expenses += t.amount;
      }
      return acc;
    }, { income: 0, expenses: 0 });
  }, [filteredTransactions]);

  const netBalance = summaryStats.income - summaryStats.expenses;

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Nav />
      <div className="ml-0 md:ml-64 p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
              <p className="text-gray-500 dark:text-gray-400">Manage and track your financial records</p>
            </div>
            <Link to="/transactions/new" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-transparent bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-sm">
              <DollarSign className="w-4 h-4" />
              Add Transaction
            </Link>
          </div>

          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Balance</h3>
                  <Wallet className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {netBalance >= 0 ? '+' : '-'}KSH {Math.abs(netBalance).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-gray-400 mt-1">Based on current filters</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</h3>
                  <ArrowUpCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +KSH {summaryStats.income.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-gray-400 mt-1">Based on current filters</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</h3>
                  <ArrowDownCircle className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  -KSH {summaryStats.expenses.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-gray-400 mt-1">Based on current filters</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtering Section */}
          <Card className="shadow-lg bg-white dark:bg-gray-800">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
              <CardTitle className="text-lg flex items-center text-gray-900 dark:text-gray-100">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-primary"
                  />
                </div>

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Date Range - Start */}
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-gray-500 z-10 pointer-events-none">
                    <span className="text-xs font-semibold mr-1">From:</span>
                  </div>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-primary"
                  />
                </div>

                {/* Date Range - End */}
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-gray-500 z-10 pointer-events-none">
                    <span className="text-xs font-semibold mr-1">To:</span>
                  </div>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-8 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Active Filters Summary & Clear */}
              {(searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' || startDate || endDate) && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500">
                    Showing {filteredTransactions.length} results
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card className="shadow-xl border-none">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-xl flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white dark:bg-gray-800 rounded-b-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Description</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200 text-right">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Category</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow className="bg-white dark:bg-gray-800">
                      <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-lg flex flex-col items-center justify-center">
                        <Search className="w-12 h-12 text-gray-300 mb-4" />
                        <p>No transactions found matching your filters.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction, index) => (
                      <TableRow key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'income'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                            }`}>
                            {transaction.type === 'income' ? (
                              <TrendingUp className="w-3 h-3 mr-1.5" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1.5" />
                            )}
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{transaction.description || '-'}</TableCell>
                        <TableCell className={`text-right font-bold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                          {transaction.type === 'income' ? '+' : '-'} KSH {transaction.amount ? transaction.amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {transaction.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-500 dark:text-gray-400 text-sm">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/transactions/${transaction.id}/edit`} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 mr-2">
                            Edit
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (!confirm('Are you sure you want to delete this transaction?')) return;
                              try {
                                const res = await fetch(`/api/transactions/${transaction.id}`, { method: 'DELETE' });
                                if (res.ok) {
                                  setTransactions(transactions.filter(t => t.id !== transaction.id));
                                } else {
                                  alert('Failed to delete transaction');
                                }
                              } catch (e) {
                                alert('Error deleting transaction');
                              }
                            }}
                            className="h-8 px-3"
                          >
                            Delete
                          </Button>
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
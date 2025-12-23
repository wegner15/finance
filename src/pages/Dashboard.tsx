import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Nav from '../components/Nav';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import TrendingDown from 'lucide-react/dist/esm/icons/trending-down';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Folder from 'lucide-react/dist/esm/icons/folder';
import BarChart from 'lucide-react/dist/esm/icons/bar-chart';
import MonthlyTrendChart from '../components/MonthlyTrendChart';
import ProjectBreakdownChart from '../components/ProjectBreakdownChart';
import CategoryBreakdownChart from '../components/CategoryBreakdownChart';

interface DashboardProps {
  theme: string;
  path: string;
  stats: {
    totalIncome: number;
    totalExpenses: number;
    pendingInvoices: number;
    activeProjects: number;
  };
  recentTransactions: any[];
  upcomingInvoices: any[];
  transactionStats: {
    monthlyTrends: Array<{
      month: string;
      month_name: string;
      income: number;
      expenses: number;
    }>;
    projectBreakdown: Array<{
      project_name: string;
      project_id: number;
      income: number;
      expenses: number;
      total: number;
    }>;
    categoryBreakdown: Array<{
      category: string;
      income: number;
      expenses: number;
      total: number;
    }>;
  };
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<DashboardProps | null>(null);

  React.useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch dashboard data', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { theme, path, stats, recentTransactions, upcomingInvoices, transactionStats } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Nav theme={theme} />
      <div className="md:ml-64 p-6 pt-20 md:pt-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-400 to-green-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">KSH {stats.totalIncome.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className="text-sm opacity-90">This month</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-red-400 to-red-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center">
                <TrendingDown className="w-5 h-5 mr-2" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">KSH {stats.totalExpenses.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className="text-sm opacity-90">This month</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Pending Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingInvoices}</div>
              <p className="text-sm opacity-90">Awaiting payment</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center">
                <Folder className="w-5 h-5 mr-2" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeProjects}</div>
              <p className="text-sm opacity-90">Total projects</p>
            </CardContent>
          </Card>
        </div>

        {/* Financial Analytics Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <BarChart className="w-6 h-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Financial Analytics</h2>
          </div>

          {/* Monthly Trends - Full Width */}
          <div className="mb-6">
            <MonthlyTrendChart data={transactionStats.monthlyTrends} />
          </div>

          {/* Project and Category Breakdown - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProjectBreakdownChart data={transactionStats.projectBreakdown} />
            <CategoryBreakdownChart data={transactionStats.categoryBreakdown} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gray-50 dark:bg-gray-800">
              <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white dark:bg-gray-800">
              {recentTransactions.length === 0 ? (
                <p className="text-muted-foreground">No transactions yet. Add your first transaction to get started.</p>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.slice(0, 5).map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.description || transaction.category}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                        {transaction.type === 'income' ? '+' : '-'}KSH {transaction.amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gray-50 dark:bg-gray-800">
              <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Upcoming Invoices</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white dark:bg-gray-800">
              {upcomingInvoices.length === 0 ? (
                <p className="text-muted-foreground">No upcoming invoices. Create an invoice to track payments.</p>
              ) : (
                <div className="space-y-4">
                  {upcomingInvoices.slice(0, 5).map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">#{invoice.id} - {invoice.client_name || 'Unknown Client'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">KSH {invoice.amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                          {invoice.status || 'draft'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
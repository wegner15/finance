import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import Nav from '../components/Nav';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

interface Invoice {
  id: number;
  company_name: string;
  client_name: string;
  amount: number;
  status: string;
  due_date: string;
  currency?: string;
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/invoices');
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch invoices');
        }
        const data = await response.json();
        setInvoices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toString().includes(searchQuery) ||
      invoice.amount.toString().includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Invoices</h1>
            <Link to="/invoices/new" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">Create Invoice</Link>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by company, client, ID or amount..."
                className="pl-9 bg-white dark:bg-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white dark:bg-gray-800">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardTitle className="text-2xl">All Invoices</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white dark:bg-gray-800">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">ID</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Company</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Client</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Due Date</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-lg">
                        {invoices.length === 0 ? "No invoices yet. Create your first invoice to get started." : "No invoices match your filters."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <TableCell className="font-mono text-sm text-gray-900 dark:text-gray-100">#{invoice.id}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{invoice.company_name || '-'}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{invoice.client_name || '-'}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{invoice.currency || 'KSH'} {invoice.amount ? invoice.amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                            {invoice.status || 'draft'}
                          </span>
                        </TableCell>
                        <TableCell>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <Link to={`/invoices/${invoice.id}`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 mr-2">View</Link>
                          <Link to={`/invoices/${invoice.id}/edit`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 mr-2">Edit</Link>
                          <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 mr-2">PDF</a>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (!confirm('Are you sure you want to delete this invoice?')) return;
                              try {
                                const res = await fetch(`/api/invoices/${invoice.id}`, { method: 'DELETE' });
                                if (res.ok) {
                                  setInvoices(invoices.filter(i => i.id !== invoice.id));
                                } else {
                                  alert('Failed to delete invoice');
                                }
                              } catch (e) {
                                alert('Error deleting invoice');
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

export default Invoices;
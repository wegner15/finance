import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import Nav from '../components/Nav';
import { Link } from 'react-router-dom';

interface Receipt {
  id: number;
  company_name: string;
  client_name: string;
  amount: number;
  status: string;
  date: string;
}

const Receipts: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await fetch('/api/receipts');
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch receipts');
        }
        const data = await response.json();
        setReceipts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Receipts</h1>
            <Link to="/receipts/new" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">New Receipt</Link>
          </div>
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
              <CardTitle className="text-2xl">All Sales Receipts</CardTitle>
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
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Date</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-lg">
                        No receipts yet. Create your first receipt.
                      </TableCell>
                    </TableRow>
                  ) : (
                    receipts.map((receipt) => (
                      <TableRow key={receipt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <TableCell className="font-mono text-sm text-gray-900 dark:text-gray-100">#{receipt.id}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{receipt.company_name || '-'}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{receipt.client_name || '-'}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">KSH {receipt.amount ? receipt.amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${receipt.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            receipt.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                            }`}>
                            {receipt.status || 'draft'}
                          </span>
                        </TableCell>
                        <TableCell>{receipt.date ? new Date(receipt.date).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <Link to={`/receipts/${receipt.id}`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 mr-2">View</Link>
                          <Link to={`/receipts/${receipt.id}/edit`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 mr-2">Edit</Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (!confirm('Are you sure you want to delete this receipt?')) return;
                              try {
                                const res = await fetch(`/api/receipts/${receipt.id}`, { method: 'DELETE' });
                                if (res.ok) {
                                  setReceipts(receipts.filter(r => r.id !== receipt.id));
                                } else {
                                  alert('Failed to delete receipt');
                                }
                              } catch (e) {
                                alert('Error deleting receipt');
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

export default Receipts;
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import Nav from '../components/Nav';

interface ReceiptsProps {
  theme: string;
  path: string;
  receipts: any[];
}

const Receipts: React.FC<ReceiptsProps> = ({ theme, path, receipts }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Nav theme={theme} path={path} />
      <div className="ml-64 p-8">
      <div className="max-w-7xl mx-auto">
         <div className="flex justify-between items-center mb-6">
           <h1 className="text-3xl font-bold text-gray-900">Receipts</h1>
           <a href="/receipts/new" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">New Receipt</a>
         </div>
         <Card className="shadow-xl">
           <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
             <CardTitle className="text-2xl">All Sales Receipts</CardTitle>
           </CardHeader>
          <CardContent className="p-6">
            <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Company</TableHead>
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
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
                      <TableRow key={receipt.id}>
                        <TableCell className="font-mono text-sm">#{receipt.id}</TableCell>
                        <TableCell>{receipt.company_name || '-'}</TableCell>
                        <TableCell>{receipt.client_name || '-'}</TableCell>
                        <TableCell>KSH {receipt.amount ? receipt.amount.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            receipt.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            receipt.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}>
                            {receipt.status || 'draft'}
                          </span>
                        </TableCell>
                        <TableCell>{receipt.date ? new Date(receipt.date).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <a href={`/receipts/${receipt.id}`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 mr-2">View</a>
                          <a href={`/receipts/${receipt.id}/edit`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1">Edit</a>
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
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import Building from 'lucide-react/dist/esm/icons/building';
import Users from 'lucide-react/dist/esm/icons/users';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Download from 'lucide-react/dist/esm/icons/download';
import Nav from '../components/Nav';

interface ViewReceiptProps {
  theme: string;
  path: string;
  receipt: any;
  company: any;
  client: any;
  project: any;
}

const ViewReceipt: React.FC<ViewReceiptProps> = ({ theme, path, receipt, company, client, project }) => {
  const items = JSON.parse(receipt.items || '[]');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Nav theme={theme} path={path} />
      <div className="ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Receipt #{receipt.id}</h1>
            <a href={`/receipts/${receipt.id}/pdf`} target="_blank" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </a>
          </div>
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-8">
              <CardTitle className="text-3xl flex items-center">
                <FileText className="w-8 h-8 mr-3" />
                Receipt Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-white dark:bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    From
                  </h3>
                  <div className="space-y-2">
                    {company.logo_url && <img src={company.logo_url} alt="Logo" className="w-16 h-16 mb-4" />}
                    <p className="font-semibold">{company.name}</p>
                    <p>{company.email}</p>
                    <p>{company.phone}</p>
                    <p>{company.address}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    To
                  </h3>
                  <div className="space-y-2">
                    <p className="font-semibold">{client.name}</p>
                    <p>{client.email}</p>
                    <p>{client.phone}</p>
                    <p>{client.address}</p>
                  </div>
                </div>
              </div>
               <div className="mb-8">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Receipt Information</h3>
                   <div className="text-right">
                     <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                       <Calendar className="w-4 h-4 mr-1" />
                       Date: {new Date(receipt.date).toLocaleDateString()}
                     </p>
                     <p className="text-sm text-gray-600 dark:text-gray-400">Status: {receipt.status}</p>
                   </div>
                 </div>
                 {project && (
                   <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Project: {project.name}</p>
                 )}
                 {(receipt.payment_method || receipt.reference_number) && (
                   <div className="mb-4">
                     <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Payment Details</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {receipt.payment_method && (
                         <p className="text-sm text-gray-600 dark:text-gray-400">
                           <span className="font-medium">Payment Method:</span> {receipt.payment_method}
                         </p>
                       )}
                       {receipt.reference_number && (
                         <p className="text-sm text-gray-600 dark:text-gray-400">
                           <span className="font-medium">Reference Number:</span> {receipt.reference_number}
                         </p>
                       )}
                     </div>
                   </div>
                 )}
               </div>
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="font-semibold text-center">Qty</TableHead>
                      <TableHead className="font-semibold text-center">Rate</TableHead>
                      <TableHead className="font-semibold text-center">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-center">KSH {item.rate.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                        <TableCell className="text-center">KSH {item.amount.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <tfoot>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td colSpan={3} className="text-right font-semibold p-2">Total:</td>
                      <td className="text-center font-semibold p-2">KSH {receipt.amount.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
              {receipt.notes && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</h3>
                  <p className="text-gray-600 dark:text-gray-400">{receipt.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewReceipt;
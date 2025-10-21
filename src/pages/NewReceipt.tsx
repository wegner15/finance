import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Folder from 'lucide-react/dist/esm/icons/folder';
import Building from 'lucide-react/dist/esm/icons/building';
import Users from 'lucide-react/dist/esm/icons/users';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Nav from '../components/Nav';

interface NewReceiptProps {
  theme: string;
  path: string;
  companies: any[];
  clients: any[];
  projects: any[];
}

interface ReceiptItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const NewReceipt: React.FC<NewReceiptProps> = ({ theme, path, companies, clients, projects }) => {
  const items: ReceiptItem[] = [{ description: '', quantity: 1, rate: 0, amount: 0 }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Nav theme={theme} path={path} />
      <div className="ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create New Receipt</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Generate a receipt for your sales with itemized details.</p>
          </div>
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-8">
              <CardTitle className="text-3xl flex items-center">
                <FileText className="w-8 h-8 mr-3" />
                Receipt Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-white dark:bg-gray-800">
              <form action="/receipts" method="post" encType="multipart/form-data" className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label htmlFor="company_id" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                       <Building className="w-4 h-4 mr-2" />
                       Company
                     </label>
                     <select
                       id="company_id"
                       name="company_id"
                       className="flex h-12 w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base ring-offset-background focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                       required
                     >
                       <option value="">Select a company</option>
                       {companies.map((company) => (
                         <option key={company.id} value={company.id}>{company.name}</option>
                       ))}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label htmlFor="client_id" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                       <Users className="w-4 h-4 mr-2" />
                       Client
                     </label>
                     <select
                       id="client_id"
                       name="client_id"
                       className="flex h-12 w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base ring-offset-background focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                       required
                     >
                       <option value="">Select a client</option>
                       {clients.map((client) => (
                         <option key={client.id} value={client.id}>{client.name}</option>
                       ))}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label htmlFor="project_id" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                       <Folder className="w-4 h-4 mr-2" />
                       Project (Optional)
                     </label>
                     <select
                       id="project_id"
                       name="project_id"
                       className="flex h-12 w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base ring-offset-background focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     >
                       <option value="">Select a project (optional)</option>
                       {projects.map((project) => (
                         <option key={project.id} value={project.id}>{project.name}</option>
                       ))}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label htmlFor="date" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                       <Calendar className="w-4 h-4 mr-2" />
                       Date
                     </label>
                     <Input
                       id="date"
                       name="date"
                       type="date"
                       className="h-12 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 rounded-lg"
                       required
                     />
                   </div>
                   <div className="space-y-2">
                     <label htmlFor="payment_method" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                       <DollarSign className="w-4 h-4 mr-2" />
                       Payment Method
                     </label>
                     <select
                       id="payment_method"
                       name="payment_method"
                       className="flex h-12 w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base ring-offset-background focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     >
                       <option value="">Select payment method</option>
                       <option value="Cash">Cash</option>
                       <option value="Bank Transfer">Bank Transfer</option>
                       <option value="Cheque">Cheque</option>
                       <option value="Credit Card">Credit Card</option>
                       <option value="M-Pesa">M-Pesa</option>
                       <option value="Other">Other</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label htmlFor="reference_number" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                       <FileText className="w-4 h-4 mr-2" />
                       Reference Number
                     </label>
                     <Input
                       id="reference_number"
                       name="reference_number"
                       type="text"
                       placeholder="Transaction reference or receipt number"
                       className="h-12 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 rounded-lg"
                     />
                   </div>
                 </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Receipt Items</h3>
                    <Button type="button" className="add-item-btn" variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200 dark:border-gray-600">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <th className="border border-gray-200 dark:border-gray-600 p-2 text-left">Description</th>
                          <th className="border border-gray-200 dark:border-gray-600 p-2 text-center w-20">Qty</th>
                          <th className="border border-gray-200 dark:border-gray-600 p-2 text-center w-24">Rate</th>
                          <th className="border border-gray-200 dark:border-gray-600 p-2 text-center w-24">Amount</th>
                          <th className="border border-gray-200 dark:border-gray-600 p-2 text-center w-12">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((_, index) => (
                          <tr key={index}>
                            <td className="border border-gray-200 dark:border-gray-600 p-2">
                              <Input
                                name={`description_${index}`}
                                placeholder="Item description"
                                className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600"
                              />
                            </td>
                            <td className="border border-gray-200 dark:border-gray-600 p-2">
                              <Input
                                name={`quantity_${index}`}
                                type="number"
                                min="1"
                                defaultValue="1"
                                className="item-quantity w-full text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600"
                              />
                            </td>
                            <td className="border border-gray-200 dark:border-gray-600 p-2">
                              <Input
                                name={`rate_${index}`}
                                type="number"
                                step="0.01"
                                min="0"
                                className="item-rate w-full text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600"
                              />
                            </td>
                            <td className="border border-gray-200 dark:border-gray-600 p-2 text-center item-amount">
                              KSH 0.00
                            </td>
                            <td className="border border-gray-200 dark:border-gray-600 p-2 text-center">
                              <Button type="button" className="remove-item-btn" variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <td colSpan={3} className="border border-gray-200 dark:border-gray-600 p-2 text-right font-semibold">Total:</td>
                          <td className="border border-gray-200 dark:border-gray-600 p-2 text-center font-semibold total-amount">KSH 0.00</td>
                          <td className="border border-gray-200 dark:border-gray-600 p-2"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>



                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href="/receipts"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-12 px-6 py-3"
                  >
                    Cancel
                  </a>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold h-12 px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Create Receipt
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="notes" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      placeholder="Add any additional notes for the receipt..."
                      className="flex min-h-[100px] w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground dark:placeholder:text-gray-400 focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={3}
                    />
                  </div>
                </div>
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            let rowCount = 1;
            function updateTotals() {
              let total = 0;
              document.querySelectorAll('tbody tr').forEach(row => {
                const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
                const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
                const amount = quantity * rate;
                row.querySelector('.item-amount').textContent = 'KSH ' + amount.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                total += amount;
              });
              document.querySelector('.total-amount').textContent = 'KSH ' + total.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            }
            const addButton = document.querySelector('.add-item-btn');
            if (addButton) {
              addButton.addEventListener('click', function() {
                const tableBody = document.querySelector('tbody');
                const newRow = document.createElement('tr');
                newRow.innerHTML = \`
                  <td class="border border-gray-200 dark:border-gray-600 p-2">
                    <input name="description_\${rowCount}" placeholder="Item description" class="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600" />
                  </td>
                  <td class="border border-gray-200 dark:border-gray-600 p-2">
                    <input name="quantity_\${rowCount}" type="number" min="1" value="1" class="item-quantity w-full text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600" />
                  </td>
                  <td class="border border-gray-200 dark:border-gray-600 p-2">
                    <input name="rate_\${rowCount}" type="number" step="0.01" min="0" class="item-rate w-full text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600" />
                  </td>
                  <td class="border border-gray-200 dark:border-gray-600 p-2 text-center item-amount">KSH 0.00</td>
                  <td class="border border-gray-200 dark:border-gray-600 p-2 text-center">
                    <button type="button" class="remove-item-btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1">Remove</button>
                  </td>
                \`;
                tableBody.appendChild(newRow);
                rowCount++;
                // Add listeners
                newRow.querySelector('.item-quantity').addEventListener('input', updateTotals);
                newRow.querySelector('.item-rate').addEventListener('input', updateTotals);
                newRow.querySelector('.remove-item-btn').addEventListener('click', function() {
                  newRow.remove();
                  updateTotals();
                });
              });
            }
            // Add listeners to existing
            document.querySelectorAll('.item-quantity, .item-rate').forEach(input => {
              input.addEventListener('input', updateTotals);
            });
            document.querySelectorAll('.remove-item-btn').forEach(btn => {
              btn.addEventListener('click', function() {
                btn.closest('tr').remove();
                updateTotals();
              });
            });
          });
        `
      }} />
    </div>
  );
};

export default NewReceipt;
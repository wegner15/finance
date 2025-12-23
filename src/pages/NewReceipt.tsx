import React, { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';

interface ReceiptItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const NewReceipt: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [items, setItems] = useState<ReceiptItem[]>([{ description: '', quantity: 1, rate: 0, amount: 0 }]);
  const [formData, setFormData] = useState({
    company_id: '',
    client_id: '',
    project_id: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: '',
    reference_number: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, cliRes, projRes] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/clients'),
          fetch('/api/projects')
        ]);

        if (compRes.ok) setCompanies(await compRes.json());
        if (cliRes.ok) setClients(await cliRes.json());
        if (projRes.ok) setProjects(await projRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof ReceiptItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'description') {
      item.description = value as string;
    } else {
      const numValue = parseFloat(value as string) || 0;
      if (field === 'quantity') item.quantity = numValue;
      if (field === 'rate') item.rate = numValue;
      item.amount = item.quantity * item.rate;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: calculateTotal(),
        items: JSON.stringify(items)
      };

      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        navigate('/receipts');
      } else {
        console.error('Failed to create receipt');
      }
    } catch (error) {
      console.error('Error submitting receipt:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800">
      <Nav />
      <div className="ml-0 md:ml-64 p-8 transition-all duration-300">
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="company_id" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <Building className="w-4 h-4 mr-2" />
                      Company
                    </label>
                    <select
                      id="company_id"
                      name="company_id"
                      value={formData.company_id}
                      onChange={handleInputChange}
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
                      value={formData.client_id}
                      onChange={handleInputChange}
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
                      value={formData.project_id}
                      onChange={handleInputChange}
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
                      value={formData.date}
                      onChange={handleInputChange}
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
                      value={formData.payment_method}
                      onChange={handleInputChange}
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
                      value={formData.reference_number}
                      onChange={handleInputChange}
                      placeholder="Transaction reference or receipt number"
                      className="h-12 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Receipt Items</h3>
                    <Button type="button" onClick={addItem} variant="outline" size="sm">
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
                        {items.map((item, index) => (
                          <tr key={index} className="bg-white dark:bg-gray-800">
                            <td className="border border-gray-200 dark:border-gray-600 p-2">
                              <Input
                                value={item.description}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                placeholder="Item description"
                                className="w-full bg-transparent text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-500 focus:border-green-500"
                              />
                            </td>
                            <td className="border border-gray-200 dark:border-gray-600 p-2">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                className="w-full text-center bg-transparent text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-500 focus:border-green-500"
                              />
                            </td>
                            <td className="border border-gray-200 dark:border-gray-600 p-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.rate}
                                onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                className="w-full text-center bg-transparent text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-500 focus:border-green-500"
                              />
                            </td>
                            <td className="border border-gray-200 dark:border-gray-600 p-2 text-center text-gray-900 dark:text-gray-100">
                              KSH {item.amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="border border-gray-200 dark:border-gray-600 p-2 text-center">
                              <Button type="button" onClick={() => removeItem(index)} variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <td colSpan={3} className="border border-gray-200 dark:border-gray-600 p-2 text-right font-semibold">Total:</td>
                          <td className="border border-gray-200 dark:border-gray-600 p-2 text-center font-semibold text-gray-900 dark:text-gray-100">
                            KSH {calculateTotal().toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="border border-gray-200 dark:border-gray-600 p-2"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any additional notes for the receipt..."
                    className="flex min-h-[100px] w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground dark:placeholder:text-gray-400 focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/receipts')}
                    className="h-12 px-6 py-3"
                  >
                    Cancel
                  </Button>
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
      </div>
    </div>
  );
};

export default NewReceipt;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Tag from 'lucide-react/dist/esm/icons/tag';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Folder from 'lucide-react/dist/esm/icons/folder';
import Nav from '../components/Nav';
import { useNavigate, useParams } from 'react-router-dom';

const DEFAULT_CATEGORIES = [
  'Consulting',
  'Development',
  'Design',
  'Marketing',
  'Hosting',
  'Tools',
  'Office',
  'Travel',
  'Utilities',
  'Taxes',
  'Salary',
  'Other'
];

interface TransactionData {
  id: string;
  type: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  project_id: string | null;
}

const EditTransaction: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [transaction, setTransaction] = useState<TransactionData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, transactionRes] = await Promise.all([
          fetch('/api/projects'),
          fetch(`/api/transactions/${id}`),
        ]);

        if (projectsRes.ok) {
          setProjects(await projectsRes.json());
        }
        if (transactionRes.ok) {
          setTransaction(await transactionRes.json());
        } else {
          console.error('Transaction not found');
          navigate('/transactions');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      id,
      type: formData.get('type'),
      amount: formData.get('amount'),
      category: formData.get('category'),
      date: formData.get('date'),
      description: formData.get('description'),
      project_id: formData.get('project_id'),
    };

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        navigate('/transactions');
      } else {
        const errorData = await response.json();
        alert('Failed to update transaction: ' + errorData.error);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Error updating transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Nav />
      <div className="ml-0 md:ml-64 p-8 transition-all duration-300">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Edit Transaction</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Update transaction details for accurate financial tracking.</p>
          </div>
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-8">
              <CardTitle className="text-3xl flex items-center">
                <CreditCard className="w-8 h-8 mr-3" />
                Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-white dark:bg-gray-800">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="type" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      className="flex h-12 w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base ring-offset-background focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                      defaultValue={transaction.type}
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Amount
                    </label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="h-12 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg"
                      required
                      defaultValue={transaction.amount}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      Category
                    </label>
                    <div className="relative">
                      <input
                        id="category"
                        name="category"
                        type="text"
                        list="categories"
                        placeholder="e.g., Freelance, Office Supplies"
                        className="flex h-12 w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base ring-offset-background focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                        defaultValue={transaction.category}
                      />
                      <datalist id="categories">
                        {DEFAULT_CATEGORIES.map((category, index) => (
                          <option key={index} value={category} />
                        ))}
                      </datalist>
                    </div>
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
                      className="h-12 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg"
                      required
                      defaultValue={transaction.date.split('T')[0]} // Ensure date format matches input type="date"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Add notes about this transaction..."
                    className="flex min-h-[100px] w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground dark:placeholder:text-gray-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    rows={3}
                    defaultValue={transaction.description}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="project_id" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Folder className="w-4 h-4 mr-2" />
                    Project (Optional)
                  </label>
                  <select
                    id="project_id"
                    name="project_id"
                    className="flex h-12 w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base ring-offset-background focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue={transaction.project_id || ''}
                  >
                    <option value="">Select a project (optional)</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/transactions')}
                    className="h-12 px-6 py-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold h-12 px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? 'Updating...' : 'Update Transaction'}
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

export default EditTransaction;
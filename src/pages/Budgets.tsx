import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Calendar, Settings2, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BudgetProgress } from '../components/BudgetProgress';
import { useConfirmation } from '../contexts/ConfirmationContext';

interface Budget {
  id: number;
  category: string;
  amount: number;
  period: string;
  start_date: string;
  spent: number;
}

const Budgets: React.FC = () => {
  const confirm = useConfirmation();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    id: null as number | null,
    category: '',
    amount: '',
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0]
  });

  const DEFAULT_CATEGORIES = [
    'Consulting', 'Development', 'Design', 'Marketing', 'Hosting', 'Tools', 'Office', 'Travel', 'Utilities', 'Taxes', 'Salary', 'Dining', 'Software', 'Rent', 'Supplies', 'Legal', 'Miscellaneous'
  ];

  const fetchBudgets = async () => {
    try {
      const res = await fetch('/api/budgets');
      const data = await res.json();
      setBudgets(data);
    } catch (e) {
      console.error('Failed to fetch budgets', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      });
      if (res.ok) {
        fetchBudgets();
        setFormData({
            id: null,
            category: '',
            amount: '',
            period: 'monthly',
            start_date: new Date().toISOString().split('T')[0]
        });
        setIsEditing(null);
      }
    } catch (e) {
      console.error('Failed to save budget', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm.confirm({
      title: 'Delete Budget',
      message: 'Are you sure you want to delete this budget? This will permanently remove it from your records.',
      variant: 'danger',
      confirmText: 'Delete'
    });
    if (!isConfirmed) return;
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
      if (res.ok) fetchBudgets();
    } catch (e) {
      console.error('Failed to delete budget', e);
    }
  };

  if (loading) return <div className="flex min-h-[50vh] w-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="w-full">
      <div className="w-full">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center ">
                 <Settings2 className="mr-3 w-8 h-8 text-primary" />
                 Budget Management
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Set and track spending goals across categories.</p>
            </div>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Budget Form */}
        <Card className="lg:col-span-1 border-none shadow-sm dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              {formData.id ? <Pencil className="mr-2 w-5 h-5" /> : <Plus className="mr-2 w-5 h-5" />}
              {formData.id ? 'Edit Budget' : 'New Budget'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <div className="relative">
                  <Input
                    placeholder="e.g. Dining, Hosting"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    list="budget-categories"
                    required
                    className="dark:bg-gray-700"
                  />
                  <datalist id="budget-categories">
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (KSh)</label>
                <Input
                  type="number"
                  placeholder="e.g. 50000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="dark:bg-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Period</label>
                  <Select 
                    value={formData.period} 
                    onValueChange={(val) => setFormData({ ...formData, period: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-xs">Start Date</label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                      className="pl-8 dark:bg-gray-700"
                    />
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {formData.id ? 'Updating...' : 'Creating...'}
                    </>
                  ) : formData.id ? 'Update Budget' : 'Create Budget'}
                </Button>
                {formData.id && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setFormData({ id: null, category: '', amount: '', period: 'monthly', start_date: new Date().toISOString().split('T')[0] })}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Budgets List */}
        <div className="lg:col-span-2 space-y-4">
          {budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-center">
               <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Settings2 className="w-8 h-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No budgets yet</h3>
               <p className="text-gray-500 max-w-sm mt-2">Create your first budget to start tracking your spending against goals.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((budget) => (
                <Card key={budget.id} className="border-none shadow-sm dark:bg-gray-800 hover:shadow-md transition-shadow group relative overflow-hidden">
                   {/* Background Decor */}
                   <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Settings2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-primary hover:bg-primary/10"
                          onClick={() => {
                            setFormData({
                              id: budget.id,
                              category: budget.category,
                              amount: budget.amount.toString(),
                              period: budget.period,
                              start_date: budget.start_date
                            });
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(budget.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <BudgetProgress
                      category={budget.category}
                      amount={budget.amount}
                      spent={budget.spent}
                      period={budget.period}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budgets;

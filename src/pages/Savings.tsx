import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import PiggyBank from 'lucide-react/dist/esm/icons/piggy-bank';
import Target from 'lucide-react/dist/esm/icons/target';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Plus from 'lucide-react/dist/esm/icons/plus';
import History from 'lucide-react/dist/esm/icons/history';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Nav from '../components/Nav';
import { useNotification } from '../contexts/NotificationContext';
import { useConfirmation } from '../contexts/ConfirmationContext';

interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  target_date: string;
}

interface Contribution {
  id: number;
  amount: number;
  date: string;
  description: string;
}

const SavingsGoals: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [history, setHistory] = useState<Contribution[]>([]);
  const [creatingGoal, setCreatingGoal] = useState(false);
  const [contributing, setContributing] = useState(false);
  const notify = useNotification();
  const confirm = useConfirmation();

  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    monthly_contribution: '',
    target_date: ''
  });

  const [contributeData, setContributeData] = useState({
    amount: '',
    description: ''
  });

  const getEstimatedMonths = (goal: SavingsGoal) => {
    const now = new Date();
    const targetDate = goal.target_date ? new Date(goal.target_date) : null;
    const remaining = Math.max(goal.target_amount - goal.current_amount, 0);

    if (targetDate && !Number.isNaN(targetDate.getTime())) {
      const diffMs = targetDate.getTime() - now.getTime();
      if (diffMs <= 0) return 0;

      const months = diffMs / (1000 * 60 * 60 * 24 * 30.4375);
      return Math.max(1, Math.ceil(months));
    }

    if (goal.monthly_contribution > 0) {
      return Math.max(1, Math.ceil(remaining / goal.monthly_contribution));
    }

    return null;
  };

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/savings-goals');
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (e) {
      notify.error('Failed to fetch savings goals');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (goalId: number) => {
    try {
      const res = await fetch(`/api/savings-goals/${goalId}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      notify.error('Failed to fetch contribution history');
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creatingGoal) return;
    setCreatingGoal(true);
    try {
      const res = await fetch('/api/savings-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          target_amount: parseFloat(formData.target_amount),
          monthly_contribution: parseFloat(formData.monthly_contribution),
          target_date: formData.target_date
        })
      });
      if (res.ok) {
        notify.success('Savings goal created');
        setFormData({ name: '', target_amount: '', monthly_contribution: '', target_date: '' });
        fetchGoals();
      }
    } catch (e) {
      notify.error('Failed to create goal');
    } finally {
      setCreatingGoal(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    if (contributing) return;
    setContributing(true);
    try {
      const res = await fetch(`/api/savings-goals/${selectedGoal}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(contributeData.amount),
          description: contributeData.description,
          date: new Date().toISOString()
        })
      });
      if (res.ok) {
        notify.success('Contribution recorded');
        setContributeData({ amount: '', description: '' });
        fetchGoals();
        fetchHistory(selectedGoal);
      }
    } catch (e) {
      notify.error('Failed to record contribution');
    } finally {
      setContributing(false);
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm.confirm({
      title: 'Delete Goal',
      message: 'Are you sure? This will also delete all contribution history and linked transactions.',
      variant: 'danger',
      confirmText: 'Delete'
    });
    if (!isConfirmed) return;
    try {
      const res = await fetch(`/api/savings-goals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify.success('Goal deleted');
        if (selectedGoal === id) setSelectedGoal(null);
        fetchGoals();
      }
    } catch (e) {
      notify.error('Failed to delete goal');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Nav />
      <div className="ml-0 md:ml-64 p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Savings Goals</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">Track and grow your future wealth.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Goal Form */}
            <Card className="lg:col-span-1 shadow-xl border-0 overflow-hidden h-fit">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6">
                <CardTitle className="text-2xl flex items-center">
                  <Target className="w-6 h-6 mr-2" />
                  New Saving Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white dark:bg-gray-800">
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold">Goal Name</label>
                    <Input 
                      placeholder="e.g. New Car, Emergency Fund" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold">Target Amount</label>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={formData.target_amount}
                        onChange={e => setFormData({ ...formData, target_amount: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold">Monthly Contribution</label>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={formData.monthly_contribution}
                        onChange={e => setFormData({ ...formData, monthly_contribution: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold">Target Date (Optional)</label>
                    <Input 
                      type="date" 
                      value={formData.target_date}
                      onChange={e => setFormData({ ...formData, target_date: e.target.value })}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4"
                    disabled={creatingGoal}
                  >
                    {creatingGoal ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Goal
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Goals List */}
            <div className="lg:col-span-2 space-y-6">
              {goals.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2">
                  <PiggyBank className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-500">No savings goals yet</h3>
                  <p className="text-gray-400">Start by creating your first goal in the form.</p>
                </Card>
              ) : (
                goals.map(goal => {
                  const progress = (goal.current_amount / goal.target_amount) * 100;
                  const remaining = goal.target_amount - goal.current_amount;
                  const monthsRemaining = getEstimatedMonths(goal);

                  return (
                    <Card 
                      key={goal.id} 
                      className={`shadow-lg border-0 overflow-hidden cursor-pointer transition-all ${selectedGoal === goal.id ? 'ring-2 ring-emerald-500' : 'hover:scale-[1.01]'}`}
                      onClick={() => {
                        setSelectedGoal(goal.id);
                        fetchHistory(goal.id);
                      }}
                    >
                      <CardContent className="p-0">
                        <div className="p-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-2xl font-bold dark:text-gray-100">{goal.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Target: KSH {goal.target_amount.toLocaleString()}
                                {goal.target_date && ` • By ${new Date(goal.target_date).toLocaleDateString()}`}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-gray-400 hover:text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(goal.id);
                              }}
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                              <span>Progress: {progress.toFixed(1)}%</span>
                              <span>KSH {goal.current_amount.toLocaleString()} saved</span>
                            </div>
                            <Progress value={progress} className="h-3 bg-gray-100 dark:bg-gray-700" />
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1 uppercase tracking-wider">Remaining</p>
                              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">KSH {Math.max(0, remaining).toLocaleString()}</p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800">
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1 uppercase tracking-wider">Estimated Time</p>
                              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                                {monthsRemaining === null
                                  ? 'N/A'
                                  : monthsRemaining === 0
                                    ? 'Due now'
                                    : monthsRemaining === 1
                                      ? '1 month'
                                      : `${monthsRemaining} months`}
                              </p>
                            </div>
                          </div>
                        </div>

                        {selectedGoal === goal.id && (
                          <div className="bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 p-6 animate-in slide-in-from-top duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* Contribution Form */}
                              <div className="space-y-4">
                                <h4 className="font-bold flex items-center">
                                  <TrendingUp className="w-4 h-4 mr-2 text-emerald-500" />
                                  Add Funds
                                </h4>
                                <form onSubmit={handleContribute} className="space-y-3">
                                  <Input 
                                    type="number" 
                                    placeholder="Amount to save" 
                                    value={contributeData.amount}
                                    onChange={e => setContributeData({ ...contributeData, amount: e.target.value })}
                                    required
                                  />
                                  <Input 
                                    placeholder="Source/Notes (e.g. Side Gig)" 
                                    value={contributeData.description}
                                    onChange={e => setContributeData({ ...contributeData, description: e.target.value })}
                                  />
                                  <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={contributing}
                                  >
                                    {contributing ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      'Contribute to Goal'
                                    )}
                                  </Button>
                                </form>
                              </div>

                              {/* History List */}
                              <div className="space-y-4">
                                <h4 className="font-bold flex items-center">
                                  <History className="w-4 h-4 mr-2 text-blue-500" />
                                  History
                                </h4>
                                <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                  {history.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic text-center py-4">No contributions yet.</p>
                                  ) : (
                                    history.map(item => (
                                      <div key={item.id} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <div>
                                          <p className="font-bold text-sm">KSH {item.amount.toLocaleString()}</p>
                                          <p className="text-xs text-gray-500">{item.description || 'Saving'}</p>
                                        </div>
                                        <p className="text-[10px] text-gray-400">{new Date(item.date).toLocaleDateString()}</p>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsGoals;

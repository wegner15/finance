import React from 'react';
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

interface NewTransactionProps {
  theme: string;
  path: string;
  projects: any[];
  categories: string[];
}

const NewTransaction: React.FC<NewTransactionProps> = ({ theme, path, projects, categories }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Nav theme={theme} path={path} />
      <div className="ml-64 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Add New Transaction</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Record income or expense for accurate financial tracking.</p>
          </div>
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-8">
              <CardTitle className="text-3xl flex items-center">
                <CreditCard className="w-8 h-8 mr-3" />
                Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-white dark:bg-gray-800">
              <form action="/transactions" method="post" className="space-y-6">
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
                      />
                      <datalist id="categories">
                        {categories.map((category, index) => (
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
                   >
                     <option value="">Select a project (optional)</option>
                     {projects.map((project) => (
                       <option key={project.id} value={project.id}>{project.name}</option>
                     ))}
                   </select>
                </div>
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href="/transactions"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-12 px-6 py-3"
                  >
                    Cancel
                  </a>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold h-12 px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Save Transaction
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

export default NewTransaction;
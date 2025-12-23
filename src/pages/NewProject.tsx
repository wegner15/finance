import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import Folder from 'lucide-react/dist/esm/icons/folder';
import Users from 'lucide-react/dist/esm/icons/users';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Nav from '../components/Nav';
import { useNavigate } from 'react-router-dom';

const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then(setClients)
      .catch((err) => console.error('Error fetching clients:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      client_id: formData.get('client_id'),
      description: formData.get('description'),
    };

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        navigate('/projects');
      } else {
        const errorData = await response.json();
        alert('Failed to create project: ' + errorData.error);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Nav />
      <div className="ml-0 md:ml-64 p-8 transition-all duration-300">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Add New Project</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Create a new project and associate it with a client.</p>
          </div>
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white py-8">
              <CardTitle className="text-3xl flex items-center">
                <Folder className="w-8 h-8 mr-3" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-white dark:bg-gray-800">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <Folder className="w-4 h-4 mr-2" />
                      Project Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter project name"
                      className="h-12 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-lg"
                      required
                      minLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="client_id" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Client
                    </label>
                    <select
                      id="client_id"
                      name="client_id"
                      className="flex h-12 w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base ring-offset-background focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
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
                    placeholder="Describe the project scope, goals, and requirements..."
                    className="flex min-h-[120px] w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground dark:placeholder:text-gray-400 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/projects')}
                    className="h-12 px-6 py-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold h-12 px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? 'Saving...' : 'Save Project'}
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

export default NewProject;
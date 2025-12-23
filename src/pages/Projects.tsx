import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import Nav from '../components/Nav';
import { Link } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
  client_id: number;
  client_name?: string;
  description: string;
  status: string;
  created_at: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Projects</h1>
            <Link to="/projects/new" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">Add Project</Link>
          </div>
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
              <CardTitle className="text-2xl">All Projects</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white dark:bg-gray-800">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Name</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Client</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Created</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-lg">
                        No projects yet. Add your first project to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    projects.map((project) => (
                      <TableRow key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <TableCell className="text-gray-900 dark:text-gray-100">{project.name}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{project.client_name || project.client_id || '-'}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{project.status || project.description || '-'}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{project.created_at ? new Date(project.created_at).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <Link to={`/projects/${project.id}/edit`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 mr-2">Edit</Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (!confirm('Are you sure you want to delete this project?')) return;
                              try {
                                const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
                                if (res.ok) {
                                  setProjects(projects.filter(p => p.id !== project.id));
                                } else {
                                  alert('Failed to delete project');
                                }
                              } catch (e) {
                                alert('Error deleting project');
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

export default Projects;
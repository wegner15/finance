import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Building } from 'lucide-react';
import Nav from '../components/Nav';
import { Link } from 'react-router-dom';

interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo_url: string;
}

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }
        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Companies</h1>
            <Link to="/companies/new" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">Add Company</Link>
          </div>
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <CardTitle className="text-2xl">All Companies</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white dark:bg-gray-800">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Name</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Email</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Phone</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Address</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Logo</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-lg">
                        No companies yet. Add your first company to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    companies.map((company) => (
                      <TableRow key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <TableCell className="text-gray-900 dark:text-gray-100">{company.name}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{company.email}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{company.phone || '-'}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{company.address || '-'}</TableCell>
                        <TableCell>
                          {company.logo_url ? (
                            <img
                              src={company.logo_url}
                              alt={`${company.name} logo`}
                              className="w-16 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-600"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                              <Building className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link to={`/companies/${company.id}/edit`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 mr-2">Edit</Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (!confirm('Are you sure you want to delete this company?')) return;
                              try {
                                const res = await fetch(`/api/companies/${company.id}`, { method: 'DELETE' });
                                if (res.ok) {
                                  setCompanies(companies.filter(c => c.id !== company.id));
                                } else {
                                  alert('Failed to delete company');
                                }
                              } catch (e) {
                                alert('Error deleting company');
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

export default Companies;
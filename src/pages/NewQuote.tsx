import React, { useState, useEffect } from 'react';
import QuoteBuilder from '../components/QuoteBuilder';
import Nav from '../components/Nav';
import { useNavigate } from 'react-router-dom';

const NewQuote: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
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

  const handleCancel = () => {
    navigate('/quotes');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Nav />
      <div className="ml-0 md:ml-64 p-8 transition-all duration-300">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create New Quote</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Create a professional quote with line items, payment milestones, and terms.
            </p>
          </div>

          <QuoteBuilder
            companies={companies}
            clients={clients}
            projects={projects}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default NewQuote;
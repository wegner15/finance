import React from 'react';
import QuoteBuilder from '../components/QuoteBuilder';
import Nav from '../components/Nav';

interface NewQuoteProps {
  theme: string;
  path: string;
  companies: any[];
  clients: any[];
  projects: any[];
}

const NewQuote: React.FC<NewQuoteProps> = ({ theme, path, companies, clients, projects }) => {
  const handleCancel = () => {
    window.location.href = '/quotes';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Nav theme={theme} path={path} />
      <div className="ml-64 p-8">
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
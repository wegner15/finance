import React from 'react';
import QuoteBuilder from '../components/QuoteBuilder';
import Nav from '../components/Nav';

interface EditQuoteProps {
  theme: string;
  path: string;
  companies: any[];
  clients: any[];
  projects: any[];
  quote: any;
}

const EditQuote: React.FC<EditQuoteProps> = ({ theme, path, companies, clients, projects, quote }) => {
  const initialData = {
    title: quote.title || '',
    companyId: quote.company_id?.toString() || '',
    clientId: quote.client_id?.toString() || '',
    projectId: quote.project_id?.toString() || '',
    introduction: quote.introduction || '',
    scope: quote.scope_summary || '',
    lineItems: JSON.parse(quote.items || '[]').map((item: any) => ({
      id: item.id || Date.now().toString(),
      description: item.description || item.item || '',
      quantity: item.quantity || 1,
      rate: item.rate || 0,
    })),
    paymentMilestones: JSON.parse(quote.payment_terms || '[]').map((term: any) => ({
      id: term.id || Date.now().toString(),
      name: term.milestone || '',
      percentage: term.percentage || 0,
      dueDate: term.due_date || '',
    })),
    terms: quote.notes || '',
    validityDays: quote.validity_period || 30,
  };

  const handleCancel = () => {
    window.location.href = '/quotes';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Nav theme={theme} path={path} />
      <div className="ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Edit Quote</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Update the quote details and save your changes.
            </p>
          </div>

          <QuoteBuilder
            initialData={initialData}
            companies={companies}
            clients={clients}
            projects={projects}
            onCancel={handleCancel}
            quoteId={quote.id.toString()}
          />
        </div>
      </div>
    </div>
  );
};

export default EditQuote;
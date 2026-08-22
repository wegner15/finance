import React, { useState, useEffect } from 'react';
import QuoteBuilder from '../components/QuoteBuilder';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

const EditQuote: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotification();
  const [companies, setCompanies] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [compRes, cliRes, projRes, quoteRes] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/clients'),
          fetch('/api/projects'),
          fetch(`/api/quotes/${id}`)
        ]);

        if (compRes.ok) setCompanies(await compRes.json());
        if (cliRes.ok) setClients(await cliRes.json());
        if (projRes.ok) setProjects(await projRes.json());

        if (quoteRes.ok) {
          const quote = await quoteRes.json();
          // Map API data to QuoteBuilder format
          const mappedData = {
            title: quote.title || '',
            companyId: quote.company_id?.toString() || '',
            clientId: quote.client_id?.toString() || '',
            projectId: quote.project_id?.toString() || '',
            introduction: quote.introduction || '',
            scope: quote.scope_summary || '',
            lineItems: (Array.isArray(quote.items) ? quote.items : JSON.parse(quote.items || '[]')).map((item: any) => ({
              id: item.id || Date.now().toString() + Math.random(),
              description: item.description || item.item || '',
              quantity: item.quantity || 1,
              rate: item.rate || 0,
            })),
            paymentMilestones: (Array.isArray(quote.payment_terms) ? quote.payment_terms : JSON.parse(quote.payment_terms || '[]')).map((term: any) => ({
              id: term.id || Date.now().toString() + Math.random(),
              name: term.milestone || term.name || '',
              percentage: term.percentage || 0,
              dueDate: term.due_date || term.dueDate || '',
            })),
            terms: quote.notes || '',
            validityDays: quote.validity_period || 30,
          };
          setInitialData(mappedData);
        } else {
          console.error("Failed to fetch quote");
          notify.error("Failed to fetch quote");
          navigate('/quotes');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleCancel = () => {
    navigate('/quotes');
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!initialData) return null;

  return (
    <div className="w-full">
      <div className="w-full">
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
            quoteId={id}
          />
        </div>
      </div>
    </div>
  );
};

export default EditQuote;
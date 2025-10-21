import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Nav from '../components/Nav';

interface ViewQuoteProps {
  theme: string;
  path: string;
  quote: any;
  company?: any;
  client?: any;
  project?: any;
}

const ViewQuote: React.FC<ViewQuoteProps> = ({ theme, path, quote, company, client, project }) => {
  const items = JSON.parse(quote.items || '[]');
  const deliverables = JSON.parse(quote.deliverables || '[]');
  const payment_terms = JSON.parse(quote.payment_terms || '[]');

  const calculateTotal = () => {
    return items.reduce((total: number, item: any) => total + item.amount, 0);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };

    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Nav theme={theme} path={path} />
      <div className="ml-64 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{quote.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">Quote #{quote.id}</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusBadge(quote.status)}`}>
                {quote.status || 'draft'}
              </span>
            </div>
            <div className="space-x-2">
              <a href={`/quotes/${quote.id}/edit`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                Edit
              </a>
              <a href={`/quotes/${quote.id}/pdf`} target="_blank" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                Download PDF
              </a>
            </div>
          </div>

          {/* Company and Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {company && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">From</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-semibold">{company.name}</p>
                    {company.email && <p className="text-sm text-gray-600">{company.email}</p>}
                    {company.phone && <p className="text-sm text-gray-600">{company.phone}</p>}
                    {company.address && <p className="text-sm text-gray-600">{company.address}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {client && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">To</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-semibold">{client.name}</p>
                    {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
                    {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
                    {client.address && <p className="text-sm text-gray-600">{client.address}</p>}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Project Info */}
          {project && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{project.name}</p>
                {project.description && <p className="text-sm text-gray-600 mt-1">{project.description}</p>}
              </CardContent>
            </Card>
          )}

          {/* Introduction */}
          {quote.introduction && (
            <Card>
              <CardHeader>
                <CardTitle>Introduction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">{quote.introduction}</p>
              </CardContent>
            </Card>
          )}

          {/* Scope Summary */}
          {quote.scope_summary && (
            <Card>
              <CardHeader>
                <CardTitle>Project Scope</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">{quote.scope_summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Deliverables */}
          {deliverables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deliverables.map((deliverable: any, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold">{deliverable.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{deliverable.description}</p>
                      {deliverable.timeline && (
                        <p className="text-sm text-gray-500 mt-1">Timeline: {deliverable.timeline}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cost Breakdown */}
          {items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Category</th>
                        <th className="text-left p-2">Item</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-right p-2">Qty</th>
                        <th className="text-right p-2">Rate</th>
                        <th className="text-right p-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.category}</td>
                          <td className="p-2">{item.item}</td>
                          <td className="p-2">{item.description}</td>
                          <td className="p-2 text-right">{item.quantity}</td>
                          <td className="p-2 text-right">KSH {item.rate.toLocaleString()}</td>
                          <td className="p-2 text-right font-semibold">KSH {item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 font-bold">
                        <td colSpan={5} className="p-2 text-right">Total:</td>
                        <td className="p-2 text-right">KSH {calculateTotal().toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Terms */}
          {payment_terms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payment_terms.map((term: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div>
                        <p className="font-semibold">{term.milestone}</p>
                        {term.description && <p className="text-sm text-gray-600">{term.description}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{term.percentage}%</p>
                        <p className="text-sm text-gray-600">KSH {term.amount.toLocaleString()}</p>
                        {term.due_date && (
                          <p className="text-xs text-gray-500">Due: {new Date(term.due_date).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conclusion */}
          {quote.conclusion && (
            <Card>
              <CardHeader>
                <CardTitle>Conclusion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">{quote.conclusion}</p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {quote.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{quote.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Footer Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 space-y-1">
                <p>Quote valid for {quote.validity_period} days</p>
                <p>Created: {new Date(quote.created_at).toLocaleDateString()}</p>
                {quote.sent_at && <p>Sent: {new Date(quote.sent_at).toLocaleDateString()}</p>}
                {quote.accepted_at && <p>Accepted: {new Date(quote.accepted_at).toLocaleDateString()}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewQuote;
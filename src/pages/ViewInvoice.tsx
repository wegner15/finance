import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Nav from '../components/Nav';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Printer from 'lucide-react/dist/esm/icons/printer';
import Edit from 'lucide-react/dist/esm/icons/edit';

const ViewInvoice: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<any>(null); // Ideally use a proper interface shared across apps
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await fetch(`/api/invoices/${id}`);
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                if (!response.ok) {
                    throw new Error('Failed to fetch invoice');
                }
                const data = await response.json();
                setInvoice(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchInvoice();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="flex h-screen w-full items-center justify-center text-red-500">
                Error: {error || 'Invoice not found'}
            </div>
        );
    }

    const items = JSON.parse(invoice.items || '[]');

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <Nav />
            <div className="ml-0 md:ml-64 p-8 transition-all duration-300">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6 flex justify-between items-center">
                        <Link to="/invoices" className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Invoices
                        </Link>
                        <div className="flex gap-2">
                            <a href={`/invoices/${id}/pdf`} target="_blank" rel="noreferrer">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Printer className="w-4 h-4" />
                                    Download PDF
                                </Button>
                            </a>
                            <Link to={`/invoices/${id}/edit`}>
                                <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                                    <Edit className="w-4 h-4" />
                                    Edit Invoice
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <Card className="shadow-2xl overflow-hidden border-0">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">Invoice #{invoice.id}</h1>
                                    <p className="opacity-90">Issued: {new Date(invoice.created_at || Date.now()).toLocaleDateString()}</p>
                                    <p className="opacity-90">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <div className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-2 ${invoice.status === 'paid' ? 'bg-green-400 text-green-900' :
                                        invoice.status === 'sent' ? 'bg-blue-300 text-blue-900' :
                                            'bg-yellow-300 text-yellow-900'
                                        }`}>
                                        {invoice.status?.toUpperCase() || 'DRAFT'}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 bg-white dark:bg-gray-800">
                            {/* Client & Bank Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div>
                                    <h3 className="text-gray-500 uppercase tracking-wider text-sm font-semibold mb-3">Bill To</h3>
                                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Client ID: {invoice.client_id} {/* Ideally fetch Name */}
                                    </div>
                                    {/* We might want to fetch Client Name in future or join in API. Currently basic ID shown if not joined in single GET */}
                                </div>
                                <div className="md:text-right">
                                    <h3 className="text-gray-500 uppercase tracking-wider text-sm font-semibold mb-3">Payment Details</h3>
                                    <div className="space-y-1 text-gray-700 dark:text-gray-300">
                                        <p><span className="font-medium">Bank:</span> {invoice.bank_name}</p>
                                        <p><span className="font-medium">Account Name:</span> {invoice.account_name}</p>
                                        <p><span className="font-medium">Account No:</span> {invoice.account_number}</p>
                                        <p><span className="font-medium">Swift Code:</span> {invoice.swift_code}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="overflow-x-auto mb-8">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                                            <th className="py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Description</th>
                                            <th className="py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-right">Qty</th>
                                            <th className="py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-right">Price</th>
                                            <th className="py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {items.map((item: any, index: number) => (
                                            <tr key={index}>
                                                <td className="py-4 text-gray-900 dark:text-gray-100 font-medium">{item.description}</td>
                                                <td className="py-4 text-right text-gray-600 dark:text-gray-400">{item.quantity}</td>
                                                <td className="py-4 text-right text-gray-600 dark:text-gray-400">{Number(item.price).toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                                                <td className="py-4 text-right text-gray-900 dark:text-gray-100 font-semibold">{Number(item.quantity * item.price).toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} className="pt-6 text-right font-bold text-gray-900 dark:text-gray-100 text-lg">Total Amount:</td>
                                            <td className="pt-6 text-right font-bold text-gray-900 dark:text-gray-100 text-xl text-indigo-600 dark:text-indigo-400">
                                                KSH {Number(invoice.amount).toLocaleString('en', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Payment Instructions */}
                            {invoice.payment_instructions && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                                    <h3 className="text-gray-900 dark:text-gray-100 font-semibold mb-2">Payment Instructions</h3>
                                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{invoice.payment_instructions}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ViewInvoice;

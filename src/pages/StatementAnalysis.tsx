import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import Upload from 'lucide-react/dist/esm/icons/upload';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Tag from 'lucide-react/dist/esm/icons/tag';
import Wallet from 'lucide-react/dist/esm/icons/wallet';
import { useNotification } from '../contexts/NotificationContext';

interface UploadRecord {
  id: number;
  source: string;
  status: 'processing' | 'completed' | 'failed';
  total_transactions: number;
  categorized_transactions: number;
  error_message: string | null;
  uploaded_at: string;
  processed_at: string | null;
}

interface StatementTransaction {
  id: number;
  tx_date: string;
  description: string;
  amount: number;
  direction: 'debit' | 'credit';
  counterparty: string | null;
  category: string;
  confidence: number | null;
  method: 'rule' | 'ai' | 'manual' | null;
}

interface ReportData {
  summary: {
    total_income: number;
    total_expenses: number;
    total_transactions: number;
  };
  spendingByCategory: Array<{
    category: string;
    total: number;
    transaction_count: number;
  }>;
}

const StatementAnalysis: React.FC = () => {
  const notify = useNotification();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [selectedUploadId, setSelectedUploadId] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<StatementTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const hasProcessingUploads = useMemo(
    () => uploads.some((upload) => upload.status === 'processing'),
    [uploads]
  );

  const fetchUploads = async () => {
    const response = await fetch('/api/statements');
    if (response.status === 401) {
      window.location.href = '/login';
      return;
    }
    if (!response.ok) {
      throw new Error('Failed to load statement uploads');
    }
    const data = await response.json();
    setUploads(data);
    if (!selectedUploadId && data.length > 0) {
      setSelectedUploadId(data[0].id);
    }
  };

  const fetchTransactions = async (uploadId: number) => {
    setLoadingTransactions(true);
    try {
      const response = await fetch(`/api/statements/${uploadId}/transactions`);
      if (!response.ok) {
        throw new Error('Failed to load extracted transactions');
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error: any) {
      notify.error(error.message || 'Failed to load statement transactions');
    } finally {
      setLoadingTransactions(false);
    }
  };

  const fetchReport = async () => {
    try {
      const response = await fetch('/api/statements/reports');
      if (!response.ok) {
        throw new Error('Failed to load reports');
      }
      const data = await response.json();
      setReport(data);
    } catch (error: any) {
      notify.error(error.message || 'Failed to load report data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchUploads(), fetchReport()]);
      if (selectedUploadId) {
        await fetchTransactions(selectedUploadId);
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchUploads(), fetchReport()]).catch((error: any) => {
      notify.error(error.message || 'Failed to load statement data');
    });
  }, []);

  useEffect(() => {
    if (selectedUploadId) {
      fetchTransactions(selectedUploadId);
    } else {
      setTransactions([]);
    }
  }, [selectedUploadId]);

  useEffect(() => {
    if (!hasProcessingUploads) {
      return;
    }

    const interval = setInterval(() => {
      fetchUploads().catch(() => {});
      fetchReport().catch(() => {});
      if (selectedUploadId) {
        fetchTransactions(selectedUploadId).catch(() => {});
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [hasProcessingUploads, selectedUploadId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      notify.error('Select a statement PDF first.');
      return;
    }

    if (!password.trim()) {
      notify.error('Enter the statement password.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', password.trim());

      const response = await fetch('/api/statements/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      notify.success('Statement upload started. Processing in background.');
      setFile(null);
      setPassword('');
      const fileInput = document.getElementById('statement-file') as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = '';
      }

      await fetchUploads();
      await fetchReport();
      if (result.upload?.id) {
        setSelectedUploadId(result.upload.id);
      }
    } catch (error: any) {
      notify.error(error.message || 'Failed to upload statement');
    } finally {
      setUploading(false);
    }
  };

  const handleReprocess = async (uploadId: number) => {
    const password = window.prompt('Enter statement password to reprocess:');
    if (!password) return;

    try {
      setRefreshing(true);
      const response = await fetch(`/api/statements/${uploadId}/reprocess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Reprocess failed');
      }

      notify.success('Reprocessing started');
      await fetchUploads();
    } catch (error: any) {
      notify.error(error.message || 'Failed to reprocess');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Statement Analysis</h1>
              <p className="text-gray-600 dark:text-gray-400">Upload M-Pesa statement PDFs, categorize transactions, and review spending.</p>
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload M-Pesa Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" onSubmit={handleUpload}>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Statement PDF</label>
                  <Input
                    id="statement-file"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Statement Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter PDF password"
                    required
                  />
                </div>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload & Analyze'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-500">Total Income</div>
                <div className="text-2xl font-bold text-green-600">
                  KSH {(report?.summary.total_income || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-500">Total Expenses</div>
                <div className="text-2xl font-bold text-red-600">
                  KSH {(report?.summary.total_expenses || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-500">Transactions</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {(report?.summary.total_transactions || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Uploaded Statements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {uploads.length === 0 ? (
                    <p className="text-sm text-gray-500">No statements uploaded yet.</p>
                  ) : (
                    uploads.map((upload) => (
                      <div
                        key={upload.id}
                        onClick={() => setSelectedUploadId(upload.id)}
                        className={`relative group cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                          selectedUploadId === upload.id
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 shadow-md'
                            : 'border-transparent bg-white dark:bg-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800 shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg mr-3">
                              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-gray-100">Upload #{upload.id}</div>
                              <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                {new Date(upload.uploaded_at).toLocaleDateString()} at {new Date(upload.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                            upload.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                              upload.status === 'failed' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' :
                                'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          }`}>
                            {upload.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                             {upload.categorized_transactions} / {upload.total_transactions} categorized
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-[10px] font-bold"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReprocess(upload.id);
                            }}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Reprocess
                          </Button>
                        </div>
                        
                        {upload.error_message && (
                          <div className="mt-3 p-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-lg">
                            <div className="text-[10px] text-rose-600 dark:text-rose-400 leading-tight">
                              {upload.error_message}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="xl:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Spending By Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                      <TableHead className="text-right">Total Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(report?.spendingByCategory || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-gray-500">No spending data yet.</TableCell>
                      </TableRow>
                    ) : (
                      (report?.spendingByCategory || []).map((item) => (
                        <TableRow key={item.category}>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-right">{item.transaction_count}</TableCell>
                          <TableCell className="text-right font-semibold">
                            KSH {Number(item.total || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="w-5 h-5 mr-2" />
                Extracted Transactions {selectedUploadId ? `(Upload #${selectedUploadId})` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <p className="text-sm text-gray-500">Loading transactions...</p>
              ) : transactions.length === 0 ? (
                <p className="text-sm text-gray-500">No transactions for selected upload yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{new Date(tx.tx_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="font-medium">{tx.description}</div>
                          {tx.counterparty && <div className="text-xs text-gray-500">{tx.counterparty}</div>}
                          {tx.method && (
                            <div className="text-xs text-gray-500">
                              {tx.method} {tx.confidence !== null && tx.confidence !== undefined ? `(${Math.round(tx.confidence * 100)}%)` : ''}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{tx.category}</TableCell>
                        <TableCell className={`text-right font-semibold ${tx.direction === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                          {tx.direction === 'debit' ? '-' : '+'}KSH {Number(tx.amount).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleManualCategory(tx.id, tx.category)}>
                            Change
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StatementAnalysis;

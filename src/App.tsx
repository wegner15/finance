import React from 'react';
import { Button } from './components/ui/button';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accounting Platform</h1>
          <p className="text-gray-600 mb-4">Manage your invoices, receipts, and quotes beautifully.</p>
          <Button>Getting Started</Button>
        </div>
      </div>
    </div>
  );
};

export default App;
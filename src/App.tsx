import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

// Lazy load pages to improve initial load
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Companies = lazy(() => import('./pages/Companies'));
const NewCompany = lazy(() => import('./pages/NewCompany'));
const EditCompany = lazy(() => import('./pages/EditCompany'));
const Clients = lazy(() => import('./pages/Clients'));
const NewClient = lazy(() => import('./pages/NewClient'));
const Projects = lazy(() => import('./pages/Projects'));
const NewProject = lazy(() => import('./pages/NewProject'));
const Transactions = lazy(() => import('./pages/Transactions'));
const NewTransaction = lazy(() => import('./pages/NewTransaction'));
const EditTransaction = lazy(() => import('./pages/EditTransaction'));
const Invoices = lazy(() => import('./pages/Invoices'));
const NewInvoice = lazy(() => import('./pages/NewInvoice'));
const EditInvoice = lazy(() => import('./pages/EditInvoice'));
const Receipts = lazy(() => import('./pages/Receipts'));
const NewReceipt = lazy(() => import('./pages/NewReceipt'));
const ViewReceipt = lazy(() => import('./pages/ViewReceipt'));
const EditReceipt = lazy(() => import('./pages/EditReceipt'));
const Quotes = lazy(() => import('./pages/Quotes'));
const NewQuote = lazy(() => import('./pages/NewQuote'));
const ViewQuote = lazy(() => import('./pages/ViewQuote'));
const EditQuote = lazy(() => import('./pages/EditQuote'));
const Profile = lazy(() => import('./pages/Profile'));

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Dashboard />} />

          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/new" element={<NewCompany />} />
          <Route path="/companies/:id/edit" element={<EditCompany />} />

          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/new" element={<NewClient />} />

          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<NewProject />} />

          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/new" element={<NewTransaction />} />
          <Route path="/transactions/:id/edit" element={<EditTransaction />} />

          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/new" element={<NewInvoice />} />
          <Route path="/invoices/:id/edit" element={<EditInvoice />} />

          <Route path="/receipts" element={<Receipts />} />
          <Route path="/receipts/new" element={<NewReceipt />} />
          <Route path="/receipts/:id" element={<ViewReceipt />} />
          <Route path="/receipts/:id/edit" element={<EditReceipt />} />

          <Route path="/quotes" element={<Quotes />} />
          <Route path="/quotes/new" element={<NewQuote />} />
          <Route path="/quotes/:id" element={<ViewQuote />} />
          <Route path="/quotes/:id/edit" element={<EditQuote />} />

          <Route path="/profile" element={<Profile />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
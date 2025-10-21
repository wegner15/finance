import React from 'react';
import Home from 'lucide-react/dist/esm/icons/home';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Receipt from 'lucide-react/dist/esm/icons/receipt';
import Quote from 'lucide-react/dist/esm/icons/quote';
import Users from 'lucide-react/dist/esm/icons/users';
import Folder from 'lucide-react/dist/esm/icons/folder';
import Building from 'lucide-react/dist/esm/icons/building';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import Sun from 'lucide-react/dist/esm/icons/sun';
import Moon from 'lucide-react/dist/esm/icons/moon';
import User from 'lucide-react/dist/esm/icons/user';

interface NavProps {
  theme: string;
  path: string;
}

const Nav: React.FC<NavProps> = ({ theme, path }) => {
  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 bg-primary text-primary-foreground">
          <h1 className="text-lg font-bold">Accounting System</h1>
        </div>
        <div className="flex-1 py-2">
          <ul className="space-y-1 px-2">
            <li>
              <a href="/" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                <Home className="w-5 h-5 mr-3" />
                Dashboard
              </a>
            </li>
            <li>
              <a href="/companies" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                <Building className="w-5 h-5 mr-3" />
                Companies
              </a>
            </li>
            <li>
              <a href="/clients" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                <Users className="w-5 h-5 mr-3" />
                Clients
              </a>
            </li>
            <li>
              <a href="/projects" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                <Folder className="w-5 h-5 mr-3" />
                Projects
              </a>
            </li>
            <li>
              <a href="/transactions" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                <CreditCard className="w-5 h-5 mr-3" />
                Transactions
              </a>
            </li>
            <li>
              <a href="/invoices" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                <FileText className="w-5 h-5 mr-3" />
                Invoices
              </a>
            </li>
            <li>
              <a href="/receipts" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                <Receipt className="w-5 h-5 mr-3" />
                Receipts
              </a>
            </li>
             <li>
               <a href="/quotes" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                 <Quote className="w-5 h-5 mr-3" />
                 Quotes
               </a>
             </li>
             <li>
               <a href="/profile" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                 <User className="w-5 h-5 mr-3" />
                 Profile
               </a>
             </li>
          </ul>
        </div>
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <form action="/theme" method="post" className="w-full">
            <input type="hidden" name="theme" value={theme === 'dark' ? 'light' : 'dark'} />
            <input type="hidden" name="redirect" value={path} />
            <button
              type="submit"
              className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </form>
          <button
            onClick={async () => {
              await fetch('/api/logout', { method: 'POST' });
              window.location.href = '/login';
            }}
            className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
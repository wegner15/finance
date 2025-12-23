import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import Menu from 'lucide-react/dist/esm/icons/menu';
import X from 'lucide-react/dist/esm/icons/x';
import { Button } from './ui/button';

interface NavProps {
  theme?: string;
}

const Nav: React.FC<NavProps> = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Theme state management
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/companies', label: 'Companies', icon: Building },
    { href: '/clients', label: 'Clients', icon: Users },
    { href: '/projects', label: 'Projects', icon: Folder },
    { href: '/transactions', label: 'Transactions', icon: CreditCard },
    { href: '/invoices', label: 'Invoices', icon: FileText },
    { href: '/receipts', label: 'Receipts', icon: Receipt },
    { href: '/quotes', label: 'Quotes', icon: Quote },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white dark:bg-gray-800 rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <nav className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 bg-primary text-primary-foreground">
            <h1 className="text-lg font-bold">Accounting System</h1>
          </div>
          <div className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive
                        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary' : ''}`} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={toggleTheme}
              className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Nav;
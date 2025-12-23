import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';
import User from 'lucide-react/dist/esm/icons/user';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Phone from 'lucide-react/dist/esm/icons/phone';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Nav from '../components/Nav';

const NewClient: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
    };

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        navigate('/clients');
      } else {
        const errorData = await response.json();
        alert('Failed to create client: ' + errorData.error);
      }
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Error creating client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Nav />
      <div className="ml-0 md:ml-64 p-8 transition-all duration-300">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Add New Client</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Enter the client's details to create a new record.</p>
          </div>
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-8">
              <CardTitle className="text-3xl flex items-center">
                <User className="w-8 h-8 mr-3" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-white dark:bg-gray-800">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter client's full name"
                      className="h-12 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-cyan-500 dark:focus:border-cyan-400 rounded-lg"
                      required
                      minLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="client@example.com"
                      className="h-12 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-cyan-500 dark:focus:border-cyan-400 rounded-lg"
                      required
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      className="h-12 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-cyan-500 dark:focus:border-cyan-400 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Address
                    </label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="Street, City, State, ZIP"
                      className="h-12 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-cyan-500 dark:focus:border-cyan-400 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/clients')}
                    className="h-12 px-6 py-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold h-12 px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? 'Saving...' : 'Save Client'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewClient;
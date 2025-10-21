import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import User from 'lucide-react/dist/esm/icons/user';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Nav from '../components/Nav';

interface ProfileProps {
  theme: string;
  path: string;
  user: any;
}

const Profile: React.FC<ProfileProps> = ({ theme, path, user }) => {
  // Get URL parameters for success/error messages
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const success = urlParams.get('success');
  const error = urlParams.get('error');

  const getMessage = () => {
    if (success === 'email_updated') {
      return { type: 'success', text: 'Email updated successfully!' };
    }
    if (success === 'password_updated') {
      return { type: 'success', text: 'Password updated successfully!' };
    }
    if (error === 'email_mismatch') {
      return { type: 'error', text: 'New email addresses do not match.' };
    }
    if (error === 'password_mismatch') {
      return { type: 'error', text: 'New passwords do not match.' };
    }
    if (error === 'invalid_current_email') {
      return { type: 'error', text: 'Current email is incorrect.' };
    }
    if (error === 'invalid_current_password') {
      return { type: 'error', text: 'Current password is incorrect.' };
    }
    if (error === 'password_too_short') {
      return { type: 'error', text: 'New password must be at least 6 characters long.' };
    }
    return null;
  };

  const message = getMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Nav theme={theme} path={path} />
      <div className="ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Profile Settings</h1>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Change Email */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gray-50 dark:bg-gray-800">
                <CardTitle className="text-xl text-gray-900 dark:text-gray-100 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Change Email
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white dark:bg-gray-800">
                <form action="/profile/email" method="post" className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="current_email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Current Email
                    </label>
                    <Input
                      id="current_email"
                      name="current_email"
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="h-12 text-base text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="new_email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      New Email
                    </label>
                    <Input
                      id="new_email"
                      name="new_email"
                      type="email"
                      placeholder="Enter new email address"
                      className="h-12 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirm_email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Confirm New Email
                    </label>
                    <Input
                      id="confirm_email"
                      name="confirm_email"
                      type="email"
                      placeholder="Confirm new email address"
                      className="h-12 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Update Email
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gray-50 dark:bg-gray-800">
                <CardTitle className="text-xl text-gray-900 dark:text-gray-100 flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white dark:bg-gray-800">
                <form action="/profile/password" method="post" className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="current_password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Current Password
                    </label>
                    <Input
                      id="current_password"
                      name="current_password"
                      type="password"
                      placeholder="Enter current password"
                      className="h-12 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="new_password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      New Password
                    </label>
                    <Input
                      id="new_password"
                      name="new_password"
                      type="password"
                      placeholder="Enter new password"
                      className="h-12 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirm_password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Confirm New Password
                    </label>
                    <Input
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      placeholder="Confirm new password"
                      className="h-12 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Account Information */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow mt-8">
            <CardHeader className="bg-gray-50 dark:bg-gray-800">
              <CardTitle className="text-xl text-gray-900 dark:text-gray-100 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white dark:bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</h3>
                  <p className="text-gray-900 dark:text-gray-100">{user?.email || 'admin@example.com'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Account Type</h3>
                  <p className="text-gray-900 dark:text-gray-100">Administrator</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Member Since</h3>
                  <p className="text-gray-900 dark:text-gray-100">January 2024</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Last Login</h3>
                  <p className="text-gray-900 dark:text-gray-100">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
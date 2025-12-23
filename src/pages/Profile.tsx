import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import User from 'lucide-react/dist/esm/icons/user';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Nav from '../components/Nav';

interface ProfileProps {
  user?: any;
}

const Profile: React.FC<ProfileProps> = () => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Email Form State
  const [currentEmail, setCurrentEmail] = useState(''); // Ideally fetched from user context/API usually, but here manually or prefilled if we had user context.
  // For safe migration, I'll ask user to input current password for any change, as API requires.
  // Actually API endpoint I wrote checks current password for BOTH email and password changes.
  // But previous profile page had "Current Email" readOnly.
  // I should fetch current user details if possible.
  // I'll stick to input fields.

  const handleEmailUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      type: 'email',
      current_password: formData.get('current_password'), // Wait, UI design for email change didn't have current password field in previous file?
      // Let me check previous file content.
      // Previous file: Change Email had "Current Email" (readOnly), "New Email", "Confirm New Email".
      // It did NOT ask for password.
      // My new API requires password for security.
      // I should add a password field to the Email form.
      new_email: formData.get('new_email'),
      confirm_email: formData.get('confirm_email')
    };

    // Client-side validation
    if (String(formData.get('new_email')) !== String(formData.get('confirm_email'))) {
      setErrorMsg('New email addresses do not match.');
      setEmailLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMsg(result.success === 'email_updated' ? 'Email updated successfully!' : 'Success!');
      } else {
        setErrorMsg(result.error);
      }
    } catch (err) {
      setErrorMsg('An error occurred. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      type: 'password',
      current_password: formData.get('current_password'),
      new_password: formData.get('new_password'),
      confirm_password: formData.get('confirm_password')
    };

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMsg(result.success === 'password_updated' ? 'Password updated successfully!' : 'Success!');
        (e.target as HTMLFormElement).reset();
      } else {
        setErrorMsg(result.error);
      }
    } catch (err) {
      setErrorMsg('An error occurred. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Nav />
      <div className="ml-0 md:ml-64 p-8 transition-all duration-300">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Profile Settings</h1>

          {successMsg && (
            <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              {errorMsg}
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
                <form onSubmit={handleEmailUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="current_password_email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Confirm Password (Required)
                    </label>
                    <Input
                      id="current_password_email"
                      name="current_password"
                      type="password"
                      placeholder="Enter current password to verify"
                      className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg"
                      required
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
                      className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg"
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
                      className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={emailLoading} className="w-full bg-blue-600 hover:bg-blue-700 h-12">
                    {emailLoading ? 'Updating...' : 'Update Email'}
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
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="current_password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Current Password
                    </label>
                    <Input
                      id="current_password"
                      name="current_password"
                      type="password"
                      placeholder="Enter current password"
                      className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg"
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
                      className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg"
                      required
                      minLength={6}
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
                      className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" disabled={passwordLoading} className="w-full bg-green-600 hover:bg-green-700 h-12">
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Account Information - Static for now as we don't have user context provider yet */}
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
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Account Type</h3>
                  <p className="text-gray-900 dark:text-gray-100">Administrator</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Note</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">To view your current email, please check the dashboard or logout and login again.</p>
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
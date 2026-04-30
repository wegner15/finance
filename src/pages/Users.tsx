import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import UserPlus from 'lucide-react/dist/esm/icons/user-plus';
import UsersIcon from 'lucide-react/dist/esm/icons/users';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';
import Wallet from 'lucide-react/dist/esm/icons/wallet';
import { useNotification } from '../contexts/NotificationContext';

type UserRecord = {
  id: number;
  email: string;
  name: string;
  role: 'expense' | 'admin' | 'project';
  created_at: string;
};

const roleLabels: Record<UserRecord['role'], string> = {
  expense: 'Expense',
  admin: 'Admin',
  project: 'Project',
};

const roleIcons: Record<UserRecord['role'], React.ReactNode> = {
  expense: <Wallet className="w-4 h-4" />,
  admin: <Shield className="w-4 h-4" />,
  project: <Briefcase className="w-4 h-4" />,
};

const Users: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'expense' as UserRecord['role'],
  });

  const loadUsers = async () => {
    try {
      const meRes = await fetch('/api/me');
      if (meRes.status === 401) {
        window.location.href = '/login';
        return false;
      }

      const me = await meRes.json();
      if (me.role !== 'admin') {
        navigate('/');
        return false;
      }

      setCurrentUserRole(me.role);

      const usersRes = await fetch('/api/users');
      if (usersRes.status === 403) {
        navigate('/');
        return false;
      }
      if (!usersRes.ok) {
        throw new Error('Failed to load users');
      }

      const data = await usersRes.json();
      setUsers(data);
      return true;
    } catch (error: any) {
      notify.error(error.message || 'Failed to load users');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      notify.error('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      notify.success('User created successfully');
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'expense',
      });
      await loadUsers();
    } catch (error: any) {
      notify.error(error.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <Nav />
      <div className="ml-0 md:ml-64 p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              <UsersIcon className="w-4 h-4" />
              Admin Access
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
            <p className="text-gray-600 dark:text-gray-400">Create internal accounts and assign their access role.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-8">
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <UserPlus className="w-5 h-5" />
                  Add User
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white dark:bg-gray-800">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="name">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Jane Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="email">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="jane@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="role">
                      Role
                    </label>
                    <select
                      id="role"
                      value={form.role}
                      onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRecord['role'] }))}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="expense">Expense</option>
                      <option value="project">Project</option>
                      <option value="admin">Admin</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Expense users track expenses only. Project users access project tools. Admins can manage all users and see all data.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="password">
                      Temporary Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Minimum 6 characters"
                      minLength={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Repeat temporary password"
                      minLength={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full h-11 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                  >
                    {saving ? 'Creating...' : 'Create User'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-xl text-gray-900 dark:text-gray-100">All Users</CardTitle>
              </CardHeader>
              <CardContent className="p-0 bg-white dark:bg-gray-800">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-10 text-center text-gray-500 dark:text-gray-400">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              {user.name}
                              {currentUserRole === 'admin' && user.role === 'admin' && user.email === 'admin@bogingo.com' ? (
                                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                                  Primary
                                </span>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">{user.email}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                              {roleIcons[user.role]}
                              {roleLabels[user.role]}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;

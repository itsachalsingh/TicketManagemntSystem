import React, { useState } from 'react';
import { useForm, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

type User = {
    id: number;
    name: string;
    email: string;
    role?: {
        id: number;
        name: string;
    };
    phone?: string;
};

type Role = {
    id: number;
    name: string;
};

type Props = {
    users: User[];
    roles: Role[];
};

export default function UserIndex({ users = [], roles = [] }: Props) {
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        role: '',
        password: '',
        password_confirmation: '',
    });

    // Populate form for editing
    const handleEdit = (user: User) => {
        setEditingUser(user);
        setData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role?.id ? String(user.role.id) : '',
            password: '',
            password_confirmation: '',
        });
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingUser(null);
        reset();
    };

    // Submit for create or update
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            put(`/admin/users/${editingUser.id}`, {
                onSuccess: () => {
                    setEditingUser(null);
                    reset();
                },
            });
        } else {
            post('/admin/users', {
                onSuccess: () => reset(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(`/admin/users/${id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title="User Management" />

            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                    <p className="text-sm text-gray-500">Create Admins or Support Agents, and manage existing users.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* User List */}
                    <div className="bg-white rounded-xl shadow p-6 border">
                        <h2 className="text-lg font-semibold mb-4">All Users</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left border rounded-lg overflow-hidden">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 font-medium text-gray-600">Name</th>
                                        <th className="px-4 py-2 font-medium text-gray-600">Email</th>
                                        <th className="px-4 py-2 font-medium text-gray-600">Role</th>
                                        <th className="px-4 py-2 font-medium text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map(user => (
                                            <tr key={user.id} className="border-t hover:bg-gray-50">
                                                <td className="px-4 py-2">{user.name}</td>
                                                <td className="px-4 py-2">{user.email}</td>
                                                <td className="px-4 py-2 capitalize">
                                                    {user.role?.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? 'N/A'}
                                                </td>
                                                <td className="px-4 py-2 flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="text-sm text-red-600 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Add/Edit User Form */}
                    <div className="bg-white rounded-xl shadow p-6 border">
                        <h2 className="text-lg font-semibold mb-4">
                            {editingUser ? 'Edit User' : 'Add New User'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {errors.email && <span className="text-sm text-red-500">{errors.email}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600">Phone</label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {errors.phone && <span className="text-sm text-red-500">{errors.phone}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600">Role</label>
                                <select
                                    value={data.role}
                                    onChange={e => setData('role', e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">Select Role</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && <span className="text-sm text-red-500">{errors.role}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600">Password</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder={editingUser ? 'Leave blank to keep current password' : ''}
                                />
                                {errors.password && <span className="text-sm text-red-500">{errors.password}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600">Confirm Password</label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder={editingUser ? 'Leave blank to keep current password' : ''}
                                />
                                {errors.password_confirmation && (
                                    <span className="text-sm text-red-500">{errors.password_confirmation}</span>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                                >
                                    {processing
                                        ? editingUser
                                            ? 'Updating...'
                                            : 'Creating...'
                                        : editingUser
                                        ? 'Update User'
                                        : 'Create User'}
                                </button>
                                {editingUser && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

type Ticket = {
    id: number;
    title: string;
    subject: string;
    ticket_number: string;
    priority: 'high' | 'medium' | 'low';
    status: string;
    created_at: string;
    user: {
        name: string;
        email: string;
        phone: string;
    };
    assigned_user?: {
        name: string;
    };
};

type Props = {
    tickets: {
        data: Ticket[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        current_page: number;
        last_page: number;
    };
};

const TicketStatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        open: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        closed: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status.toUpperCase()}
        </span>
    );
};

const AdminTicketIndex = ({ tickets }: Props) => {
    return (
        <AdminLayout>
            <Head title="Ticket Management" />
            <div className="p-6 bg-white rounded shadow">
                <h2 className="text-xl font-semibold mb-4">Ticket Management</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 border">ID</th>
                                <th className="p-3 border">Title</th>
                                <th className="p-3 border">Ticket Number</th>
                                <th className="p-3 border">Priority</th>
                                <th className="p-3 border">User</th>
                                <th className="p-3 border">Assigned To</th>
                                <th className="p-3 border">Status</th>
                                <th className="p-3 border">Created At</th>
                                <th className="p-3 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets?.data?.length ? (
                                tickets.data.map(ticket => (
                                    <tr key={ticket.id} className="hover:bg-gray-50">
                                        <td className="p-3 border">{ticket.id}</td>
                                        <td className="p-3 border">{ticket.subject}</td>
                                        <td className="p-3 border">{ticket.ticket_number}</td>
                                        <td className="p-3 border">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${ticket.priority === 'high'
                                                        ? 'bg-red-100 text-red-800'
                                                        : ticket.priority === 'medium'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}
                                            >
                                                {ticket.priority ? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1) : 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="p-3 border">{ticket.user.name}</td>
                                        <td className="p-3 border">{ticket.assigned_user?.name ?? 'Unassigned'}</td>
                                        <td className="p-3 border">
                                            <TicketStatusBadge status={ticket.status} />
                                        </td>
                                        <td className="p-3 border">{new Date(ticket.created_at).toLocaleString()}</td>
                                        <td className="p-3 border">
                                            <a
                                                href={`/admin/tickets/${ticket.id}`}
                                                className="text-indigo-600 hover:underline"
                                            >
                                                View
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-gray-500">
                                        No tickets found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {tickets.links.map((link, index) => (
                        <a
                            key={index}
                            href={link.url || '#'}
                            className={`px-3 py-1 rounded border text-sm ${link.active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                                }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminTicketIndex;

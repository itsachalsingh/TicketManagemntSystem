import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminLayout from '@/Layouts/AdminLayout';

type Ticket = {
    id: number;
    ticket_number: string;
    subject: string;
    status: string;
    created_at: string;
};

interface DashboardProps {
    tickets: Ticket[];
}

export default function TicketsDashboard({ tickets }: DashboardProps) {
    const [search, setSearch] = useState('');
    const filtered = tickets.filter(ticket =>
        ticket.ticket_number.toLowerCase().includes(search.toLowerCase())
    );

    const countByStatus = (status: string) =>
        tickets.filter(ticket => ticket.status === status).length;

    return (
        <AdminLayout>
            <Head title="Tickets Dashboard" />

            <div className="py-6 bg-gray-100 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 space-y-6">

                    {/* Dashboard Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <StatCard title="Open Tickets" count={countByStatus('open')} color="green" />
                        <StatCard title="In Progress" count={countByStatus('in_progress')} color="yellow" />
                        <StatCard title="Resolved" count={countByStatus('resolved')} color="blue" />
                    </div>

                    {/* Search and List */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by Ticket Number"
                                className="border border-gray-300 rounded px-3 py-2 w-full sm:w-64 focus:ring focus:ring-indigo-200"
                            />
                        </div>

                        {filtered.length === 0 ? (
                            <p className="text-gray-500 text-sm">No tickets found.</p>
                        ) : (
                            <div className="space-y-4">
                                {filtered.map(ticket => (
                                    <div key={ticket.id} className="border rounded-lg p-4 shadow-sm hover:shadow transition">
                                        <div className="flex justify-between flex-col sm:flex-row gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Ticket #{ticket.ticket_number}</p>
                                                <h3 className="text-lg font-semibold">{ticket.subject}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(ticket.created_at).toLocaleString('en-GB', {
                                                        timeZone: 'Asia/Kolkata',
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-4">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize
                                                    ${ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                                                        ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                                            ticket.status === 'resolved' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {ticket.status.replace('_', ' ')}
                                                </span>
                                                <Link
                                                    href={route('tickets.show', ticket.id)}
                                                    className="text-sm text-indigo-600 hover:underline font-medium"
                                                >
                                                    View →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ title, count, color }: { title: string; count: number; color: string }) {
    const bg = {
        green: 'bg-green-100 text-green-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        blue: 'bg-blue-100 text-blue-800',
    }[color];

    return (
        <div className={`rounded-lg p-6 shadow ${bg}`}>
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="text-3xl font-bold">{count}</p>
        </div>
    );
}

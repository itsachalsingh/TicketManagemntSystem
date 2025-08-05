import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

type Ticket = {
    id: number;
    ticket_number: string;
    subject: string;
    status: string;
    priority: 'high' | 'medium' | 'low';
    created_at: string;
};

interface DashboardProps {
    tickets: Ticket[];
    latestTickets: Ticket[];
    newUsersCount: number;
    totalTickets: number;
    ticketStats: {
        open: number;
        in_progress: number;
        resolved: number;
        pending: number;
    };
    priorityStats: {
        high: number;
        medium: number;
        low: number;
    };
}

export default function TicketsDashboard({
    tickets,
    latestTickets,
    newUsersCount,
    totalTickets,
    ticketStats,
    priorityStats,
}: DashboardProps) {
    const [search, setSearch] = useState('');
    const filtered = tickets.filter(ticket =>
        ticket.ticket_number.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <Head title="Dashboard" />

            <div className="py-8 bg-gray-100 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 space-y-10">

                    {/* Dashboard Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="New Users Today" count={newUsersCount} color="indigo" />
                        <StatCard title="Total Tickets" count={totalTickets} color="blue" />
                        <StatCard title="Pending Tickets" count={ticketStats.pending} color="yellow" />
                        <StatCard title="Resolved Tickets" count={ticketStats.resolved} color="green" />
                    </div>

                    {/* Priority Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <StatCard title="High Priority" count={priorityStats.high} color="red" />
                        <StatCard title="Medium Priority" count={priorityStats.medium} color="orange" />
                        <StatCard title="Low Priority" count={priorityStats.low} color="green" />
                    </div>

                    {/* Search Bar */}
                    <section className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                            <h2 className="text-lg font-semibold">Search Tickets</h2>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Enter Ticket Number"
                                className="border border-gray-300 rounded px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>

                        {search && (
                            <>
                                {filtered.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No tickets found for "{search}".</p>
                                ) : (
                                    <ul className="space-y-4">
                                        {filtered.map(ticket => (
                                            <li key={ticket.id} className="border rounded-lg p-4 hover:shadow-sm transition">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm text-gray-500 font-mono">#{ticket.ticket_number}</p>
                                                        <h4 className="text-md font-semibold">{ticket.subject}</h4>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <StatusBadge status={ticket.status} />
                                                        <Link
                                                            href={route('tickets.show', ticket.id)}
                                                            className="text-sm text-indigo-600 hover:underline"
                                                        >
                                                            View →
                                                        </Link>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </section>

                    {/* Latest 5 Tickets */}
                    <section className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Latest 5 Tickets</h2>
                            <Link href="/admin/tickets" className="text-sm text-indigo-600 hover:underline">
                                View All →
                            </Link>
                        </div>

                        <ul className="space-y-4">
                            {latestTickets.length === 0 ? (
                                <p className="text-gray-500 text-sm">No recent tickets available.</p>
                            ) : (
                                latestTickets.map(ticket => (
                                    <li key={ticket.id} className="border rounded-md p-4 hover:shadow-sm transition">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-gray-500 font-mono">#{ticket.ticket_number}</p>
                                                <h3 className="text-md font-semibold text-gray-800">{ticket.subject}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(ticket.created_at).toLocaleString('en-IN', {
                                                        timeZone: 'Asia/Kolkata',
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <StatusBadge status={ticket.status} />
                                                <Link
                                                    href={route('tickets.show', ticket.id)}
                                                    className="text-sm text-indigo-600 hover:underline"
                                                >
                                                    View →
                                                </Link>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </section>


                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ title, count, color }: { title: string; count: number; color: string }) {
    const bgMap: Record<string, string> = {
        green: 'bg-green-100 text-green-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        blue: 'bg-blue-100 text-blue-800',
        red: 'bg-red-100 text-red-800',
        gray: 'bg-gray-100 text-gray-800',
        orange: 'bg-orange-100 text-orange-800',
        indigo: 'bg-indigo-100 text-indigo-800',
    };

    return (
        <div className={`rounded-lg p-4 shadow-sm ${bgMap[color] || 'bg-gray-100 text-gray-800'}`}>
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="text-3xl font-bold">{count}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colorMap: Record<string, string> = {
        open: 'bg-green-100 text-green-700',
        in_progress: 'bg-yellow-100 text-yellow-700',
        resolved: 'bg-blue-100 text-blue-700',
        pending: 'bg-red-100 text-red-700',
        reopened: 'bg-purple-100 text-purple-700',
        default: 'bg-gray-100 text-gray-700',
    };

    const label = status.replace('_', ' ');
    const className = colorMap[status] || colorMap.default;

    return (
        <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${className}`}>
            {label}
        </span>
    );
}

import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

type Ticket = {
    id: number;
    ticket_number: string;
    subject: string;
    description: string;
    status: string;
    created_at: string;
};

interface TicketIndexProps {
    tickets: Ticket[];
}

export default function TicketIndex({ tickets }: TicketIndexProps) {
    const [search, setSearch] = useState('');
    const [filtered, setFiltered] = useState<Ticket[]>(tickets);

    const handleSearch = () => {
        const term = search.toLowerCase();
        const result = tickets.filter(t =>
            t.ticket_number.toLowerCase().includes(term)
        );
        setFiltered(result);
    };

    return (

        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >


            <div className="p-6 bg-gray-100 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by Ticket Number"
                                className="border border-gray-300 rounded px-3 py-2 w-full sm:w-64 focus:ring focus:ring-indigo-200"
                            />
                            <button
                                onClick={handleSearch}
                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                            >
                                Search
                            </button>
                        </div>
                        <Link
                            href={route('tickets.create')}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                        >
                            + New Ticket
                        </Link>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Your Tickets</h2>

                        {filtered.length === 0 ? (
                            <p className="text-gray-500 text-sm">No tickets found.</p>
                        ) : (
                            <div className="grid gap-4">
                                {filtered.map(ticket => (
                                    <div
                                        key={ticket.id}
                                        className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-5"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {/* Left Column: Ticket Info */}
                                            <div>


                                                <h4 className="text-sm font-semibold text-gray-500 mt-2">Ticket Number</h4>
                                                <p className="text-sm text-gray-600">#{ticket.ticket_number}</p>

                                                <h4 className="text-sm font-semibold text-gray-500 mt-2">Created At</h4>
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

                                            {/* Middle Column: Description */}
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-500">Subject</h4>
                                                <p className="text-base font-medium text-gray-800">{ticket.subject}</p>
                                                <h4 className="text-sm font-semibold text-gray-500">Description</h4>
                                                <p className="text-sm text-gray-700 mt-1">
                                                    {ticket.description.length > 50
                                                        ? `${ticket.description.substring(0, 50)}...`
                                                        : ticket.description}
                                                </p>
                                            </div>

                                            {/* Right Column: Status + Action */}
                                            <div className="flex flex-col items-start sm:items-end justify-between gap-4">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-500">Status</h4>
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize inline-block mt-1 ${ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                                                            ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                                                ticket.status === 'resolved' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {ticket.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <Link
                                                    href={route('tickets.show', ticket.id)}
                                                    className="text-sm text-indigo-600 hover:underline font-medium"
                                                >
                                                    View Ticket →
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
        </AuthenticatedLayout>
    );
}

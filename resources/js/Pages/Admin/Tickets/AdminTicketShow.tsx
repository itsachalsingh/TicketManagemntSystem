import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import type { User as BaseUser } from '@/types';

interface Role {
    id: number;
    name: string;
}

interface User extends BaseUser {
    role?: Role;
    role_id?: number;
}

interface Category {
    id: number;
    name: string;
}

interface SubCategory {
    id: number;
    name: string;
}

interface TicketComment {
    id: number;
    message: string;
    user: User;
    created_at: string;
}

interface Ticket {
    id: number;
    ticket_number: string;
    title: string;
    subject: string;
    description: string;
    category: Category | null;
    sub_category: SubCategory | null;
    priority: 'low' | 'medium' | 'high';
    status?: string;
    created_at: string;
    updated_at: string;
    user?: User;
    assigned_user?: User;
    closed_at?: string;
    comments: TicketComment[];
    role?: Role;
}

interface ShowProps {
    ticket: Ticket;
    comments: TicketComment[];
}

const AdminTicketShow = ({ ticket, comments }: ShowProps) => {
    const { auth } = usePage().props as { auth: { user: User } };

    const { data, setData, post, processing, reset, errors } = useForm({
        message: '',
        ticket_id: ticket.id,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('comments.store'), {
            onSuccess: () => reset('message'),
        });
    };

    const getPriorityStyle = (priority: Ticket['priority']) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-700';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <AdminLayout>
            <Head title={`Ticket: ${ticket.title}`} />

            <div className="p-6 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <Link
                        href={route('admin.tickets.index')}
                        className="text-sm text-indigo-600 hover:underline"
                    >
                        ← Back to ticket list
                    </Link>
                    <h1 className="text-lg font-semibold text-gray-800">Ticket Details</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left: Ticket Info */}
                    <div className="md:col-span-2">
                        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-md rounded-2xl p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">


                            </div>
                            <Detail label="Title" value={ticket.subject} isFull />
                            <Detail label="Description" value={ticket.description} isFull isPre />
                        </div>
                    </div>

                    {/* Right: Assigned User */}
                    <div>
                        <div className="bg-white border border-gray-200 shadow rounded-2xl p-8 h-full flex flex-col justify-center">
                            {ticket.assigned_user ? (
                                <div className="space-y-2">
                                    <Detail label="Ticket ID" value={ticket.ticket_number} />
                                    <Detail
                                        label="Category"
                                        value={
                                            ticket.category
                                                ? ticket.sub_category
                                                    ? `${ticket.category.name} - ${ticket.sub_category.name}`
                                                    : ticket.category.name
                                                : '—'
                                        }
                                    />
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <p className="text-gray-500">Priority</p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide ${getPriorityStyle(ticket.priority)}`}>
                                                {ticket.priority.toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Status</p>
                                            <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                                                {ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 border" />
                                        <span className="font-semibold text-gray-800">—</span>
                                    </div>
                                    <Detail label="Role" value="—" />
                                    <Detail label="Email" value="—" />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4 mt-4">

                                <div>
                                    <p className="text-gray-500">Created Date</p>
                                    <p className="text-gray-800">{new Date(ticket.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Closed Date</p>
                                    <p className="text-gray-800">{ticket.closed_at ? new Date(ticket.closed_at).toLocaleDateString() : '—'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className='mt-4'>
                                    <p className="text-gray-500">Created By</p>
                                    <p className="text-gray-800">{ticket.user?.name || '—'}</p>
                                </div>
                                <div className='mt-4'>
                                    <p className="text-gray-500">Assigned To</p>
                                    <p className="text-gray-800">{ticket.assigned_user?.name || 'Unassigned'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Discussion / Comments */}
                <div className="bg-white border border-gray-200 shadow rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Discussion</h3>
                    {comments.length > 0 ? (
                        <div className="space-y-4">
                            {comments.map(comment => (
                                <div key={comment.id} className="border border-gray-200 rounded p-4 bg-gray-50">
                                    <div className="text-sm font-medium text-gray-800">{comment.user.name}</div>
                                    <div className="text-sm text-gray-700 mt-1">{comment.message}</div>
                                    <div className="text-xs text-gray-400 mt-1">{new Date(comment.created_at).toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 mb-4">No comments yet.</p>
                    )}

                    <form onSubmit={submit} className="mt-6 space-y-2">
                        <textarea
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
                            placeholder="Write a reply..."
                        />
                        {errors.message && <div className="text-red-500 text-xs">{errors.message}</div>}
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-indigo-600 text-white px-4 py-2 text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Post Comment
                        </button>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminTicketShow;

// Reusable component
function Detail({
    label,
    value,
    color = 'text-gray-800',
    isFull = false,
    isPre = false,
}: {
    label: string;
    value: string;
    color?: string;
    isFull?: boolean;
    isPre?: boolean;
}) {
    const spanClass = isFull ? 'md:col-span-2' : '';
    const textClass = `text-base ${color}`;
    return (
        <div className={spanClass}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className={textClass + (isPre ? ' whitespace-pre-wrap' : '')}>{value}</p>
        </div>
    );
}

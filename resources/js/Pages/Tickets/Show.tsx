import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface User {
  name: string;
  email: string;
}

interface Ticket {
  id: number;
  ticket_number: string;
  title: string;
  subject: string;
  description: string;
  category: string;
  sub_category?: string;
  priority: 'low' | 'medium' | 'high';
  status?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  assigned_user?: User;
}

interface ShowProps {
  ticket: Ticket;
}

export default function Show({ ticket }: ShowProps) {
  const getPriorityStyle = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AuthenticatedLayout header={<h2 className="text-lg font-semibold text-black">{ticket.title}</h2>}>
      <Head title={`Ticket: ${ticket.title}`} />

      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-2xl p-8 space-y-6">
          {/* Ticket Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Ticket ID</p>
              <p className="text-lg font-semibold text-blue-700">{ticket.ticket_number}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="text-base">{ticket.category}</p>
            </div>

            {ticket.sub_category && (
              <div>
                <p className="text-sm text-gray-500">Sub Category</p>
                <p className="text-base">{ticket.sub_category}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500">Priority</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getPriorityStyle(ticket.priority)}`}>
                {ticket.priority ? ticket.priority.toUpperCase() : '—'}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="text-base">{new Date(ticket.created_at).toLocaleDateString()}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Updated At</p>
              <p className="text-base">{new Date(ticket.updated_at).toLocaleDateString()}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-base">
                {ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : '—'}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Title</p>
              <p className="text-lg font-medium text-gray-800">{ticket.subject}</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-base text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {ticket.user && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Created By</p>
                <p className="text-base text-gray-700">
                  {ticket.user.name} ({ticket.user.email})
                </p>
              </div>
            )}

            {ticket.assigned_user && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Assigned To</p>
                <p className="text-base text-gray-700">
                  {ticket.assigned_user.name} ({ticket.assigned_user.email})
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Link
            href={route('dashboard')}
            className="inline-block text-sm text-blue-600 hover:underline"
          >
            ← Back to ticket list
          </Link>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

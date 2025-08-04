import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: SelectOption[];
}

interface InputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    type?: string;
    placeholder?: string;
}

export default function TicketForm() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        description: '',
        priority: 'medium',
        category: 'support',
        sub_category: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tickets.store'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-lg font-semibold text-black">Create Ticket</h2>}>
            <div className="bg-white min-h-screen py-8 px-4">
                <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg shadow p-6 md:p-8">
                    <h1 className="text-xl font-bold text-black mb-6">Submit a Ticket</h1>

                    <form onSubmit={submit} className="space-y-5 text-black text-sm">
                        {/* Name, Email, Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                            />
                            <Input
                                label="Phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                error={errors.phone}
                            />
                        </div>

                        {/* Subject */}
                        <Input
                            label="Subject"
                            value={data.subject}
                            onChange={(e) => setData('subject', e.target.value)}
                            error={errors.subject}
                        />

                        {/* Description */}
                        <div>
                            <label className="block font-medium mb-1">Description</label>
                            <textarea
                                rows={4}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                                placeholder="Enter details"
                            />
                            {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                        </div>

                        {/* Priority, Category, Sub Category */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                                label="Priority"
                                value={data.priority}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                    setData('priority', e.target.value)
                                }
                                options={[
                                    { value: 'low', label: 'Low' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'high', label: 'High' },
                                ]}
                            />
                            <Select
                                label="Category"
                                value={data.category}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                    setData('category', e.target.value)
                                }
                                options={[
                                    { value: 'support', label: 'Support' },
                                    { value: 'bug', label: 'Bug' },
                                    { value: 'feature', label: 'Feature Request' },
                                    { value: 'other', label: 'Other' },
                                ]}
                            />
                            <Input
                                label="Sub Category"
                                value={data.sub_category}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setData('sub_category', e.target.value)
                                }
                                error={errors.sub_category}
                                placeholder="Optional"
                            />
                        </div>

                        {/* Submit */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
                            >
                                Create Ticket
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Input Component
const Input = ({ label, value, onChange, error, type = 'text', placeholder = '' }: InputProps) => (
    <div>
        <label className="block font-medium mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
        />
        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
);

// Select Component
const Select = ({ label, value, onChange, options }: SelectProps) => (
    <div>
        <label className="block font-medium mb-1">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

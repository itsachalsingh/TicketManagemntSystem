import { useForm, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface children {
    id: number;
    name: string;
    category_id: number;
}

interface Category {
    children: Category | undefined;
    id: number;
    name: string;
    subcategories: children[];
}

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

interface User {
    name?: string;
    email?: string;
    phone?: string;
    role_id?: number;
}

export default function TicketForm() {
    const { auth, categories } = usePage().props as unknown as {
        auth: { user: User };
        categories: Category[];
    };

    const user = auth.user;
    const [availableSubCategories, setAvailableSubCategories] = useState<children[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        description: '',
        priority: 'medium',
        category: '',
        sub_category: '',
    });

    useEffect(() => {
        if (user && user.role_id === 4) {
            setData('name', user.name || '');
            setData('email', user.email || '');
            setData('phone', user.phone || '');
        }
    }, [user]);

    useEffect(() => {
        const selectedCategory = categories.find(
            (cat) => cat.id.toString() === data.category
        );
       if (selectedCategory && selectedCategory.subcategories) {
            setAvailableSubCategories(selectedCategory.subcategories);
        } else {
            setAvailableSubCategories([]);
        }
        setData('sub_category', '');
    }, [data.category]);
    // Rename subcategory to children in state and logic
    useEffect(() => {
        const selectedCategory = categories.find(
            (cat) => cat.id.toString() === data.category
        );
        if (selectedCategory && selectedCategory.children) {
            setAvailableSubCategories(
                Array.isArray(selectedCategory.children)
                    ? selectedCategory.children
                    : []
            );
        } else {
            setAvailableSubCategories([]);
        }
        // setData('children', ''); // Removed: 'children' is not a valid form field
    }, [data.category]);
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tickets.store'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-lg font-semibold text-black">Create Ticket</h2>}>
            <div className="min-h-screen py-8 px-4">
                <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg shadow p-6 md:p-8">
                    <div className="flex flex-row items-center justify-between mb-6">
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-black"
                        >
                            <span className="mr-2 text-lg">&larr;</span>
                            Back to Tickets
                        </Link>
                    </div>

                    <form onSubmit={submit} className="space-y-5 text-black text-sm">
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

                        <Input
                            label="Subject"
                            value={data.subject}
                            onChange={(e) => setData('subject', e.target.value)}
                            error={errors.subject}
                        />

                        <div>
                            <label className="block font-medium mb-1">Description</label>
                            <textarea
                                rows={4}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                                placeholder="Enter details"
                            />
                            {errors.description && (
                                <div className="text-red-500 text-xs mt-1">{errors.description}</div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                                label="Priority"
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                                options={[
                                    { value: 'low', label: 'Low' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'high', label: 'High' },
                                ]}
                            />
                            <Select
                                label="Category"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                options={categories.map((category) => ({
                                    value: category.id.toString(),
                                    label: category.name,
                                }))}
                            />
                            {availableSubCategories.length > 0 && (
                                <Select
                                    label="Sub Category"
                                    value={data.sub_category}
                                    onChange={(e) => setData('sub_category', e.target.value)}
                                    options={availableSubCategories.map((sub) => ({
                                        value: sub.id.toString(),
                                        label: sub.name,
                                    }))}
                                />
                            )}
                        </div>

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
            <option value="">Select {label}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

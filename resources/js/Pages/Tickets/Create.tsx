import { useForm, Link, usePage, Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import imageCompression from 'browser-image-compression';

interface ChildCategory {
  id: number;
  name: string;
  category_id: number;
}
interface Category {
  id: number;
  name: string;
  subcategories: ChildCategory[];
  children?: ChildCategory[] | Category;
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

type Priority = 'low' | 'medium' | 'high';

/** IMPORTANT: add an index signature so it satisfies Inertia’s FormData constraint */
type FormDataShape = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  description: string;
  priority: Priority;
  category: string;
  sub_category: string;
  attachments: File[];
} & Record<string, any>;

export default function TicketForm() {
  const { auth, categories } = usePage().props as unknown as {
    auth: { user: User };
    categories: Category[];
  };

  const user = auth.user;
  const [availableSubCategories, setAvailableSubCategories] = useState<ChildCategory[]>([]);
  const [preview, setPreview] = useState<{ url: string; type: 'image' | 'video' }[]>([]);

  const { data, setData, post, processing, errors, transform } = useForm<FormDataShape>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    description: '',
    priority: 'medium',
    category: '',
    sub_category: '',
    attachments: [],
  });

  useEffect(() => {
    if (user && user.role_id === 4) {
      setData('name', user.name || '');
      setData('email', user.email || '');
      setData('phone', user.phone || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role_id]);

  useEffect(() => {
    const selectedCategory = categories.find((cat) => cat.id.toString() === data.category);
    if (selectedCategory?.subcategories?.length) {
      setAvailableSubCategories(selectedCategory.subcategories);
    } else if (selectedCategory?.children) {
      const children = Array.isArray(selectedCategory.children) ? selectedCategory.children : [];
      setAvailableSubCategories(children as ChildCategory[]);
    } else {
      setAvailableSubCategories([]);
    }
    setData('sub_category', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.category]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 10); // enforce 10 files client-side
    setData('attachments', arr);
    setPreview(
      arr.map((f) => ({
        url: URL.createObjectURL(f),
        type: f.type.startsWith('video') ? 'video' : 'image',
      }))
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // compress images on client
    const compressed: File[] = [];
    for (const f of data.attachments) {
      if (f.type.startsWith('image/')) {
        const c = await imageCompression(f, {
          maxWidthOrHeight: 1920,
          maxSizeMB: 1.25,
          initialQuality: 0.7,
          fileType: 'image/webp',
          useWebWorker: true,
        });
        const renamed = new File(
          [c],
          f.name.replace(/\.(jpe?g|png|webp|heic|heif)$/i, '.webp'),
          { type: 'image/webp' }
        );
        compressed.push(renamed);
      } else {
        compressed.push(f); // videos -> server will transcode
      }
    }

    // build FormData via transform
    transform((orig) => {
      const fd = new FormData();
      fd.append('name', orig.name);
      fd.append('email', orig.email);
      fd.append('phone', orig.phone);
      fd.append('subject', orig.subject);
      fd.append('description', orig.description);
      fd.append('priority', orig.priority);
      fd.append('category', orig.category);
      fd.append('sub_category', orig.sub_category || '');

      compressed.forEach((file, idx) => fd.append(`attachments[${idx}]`, file));
      return fd;
    });

    post(route('tickets.store'), {
      forceFormData: true,
      onFinish: () => {
        preview.forEach((p) => URL.revokeObjectURL(p.url));
      },
    });
  };

  // Collect array-item errors like attachments.0, attachments.1, etc.
  const attachmentErrors = useMemo(() => {
    const out: string[] = [];
    const errs = errors as Record<string, string>;
    for (const key in errs) {
      if (key === 'attachments' || key.startsWith('attachments.')) {
        out.push(errs[key]);
      }
    }
    return out;
  }, [errors]);

  return (
    <AuthenticatedLayout header={<h2 className="text-lg font-semibold text-black">Create Ticket</h2>}>
      <Head title="Create Ticket" />
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg shadow p-6 md:p-8">
          <div className="flex flex-row items-center justify-between mb-6">
            <Link href={route('dashboard')} className="inline-flex items-center text-sm text-gray-600 hover:text-black">
              <span className="mr-2 text-lg">&larr;</span>
              Back to Tickets
            </Link>
          </div>

          <form onSubmit={submit} className="space-y-5 text-black text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name as string} />
              <Input label="Email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email as string} />
              <Input label="Phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} error={errors.phone as string} />
            </div>

            <Input label="Subject" value={data.subject} onChange={(e) => setData('subject', e.target.value)} error={errors.subject as string} />

            <div>
              <label className="block font-medium mb-1">Description</label>
              <textarea
                rows={4}
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Enter details"
              />
              {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description as string}</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Priority"
                value={data.priority}
                onChange={(e) => setData('priority', e.target.value as Priority)}
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

            {/* Attachments */}
            <div>
              <label className="block font-medium mb-1">Attachments (images/videos)</label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleFiles(e.target.files)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />

              {/* Show attachment validation errors (array + root key) */}
              {attachmentErrors.length > 0 && (
                <ul className="mt-1 space-y-1">
                  {attachmentErrors.map((msg, i) => (
                    <li key={i} className="text-red-500 text-xs">{msg}</li>
                  ))}
                </ul>
              )}

              {preview.length > 0 && (
                <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-2">
                  {preview.map((p, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded border">
                      {p.type === 'video' ? (
                        <video src={p.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={p.url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Up to 10 files. Images are compressed automatically; videos will be optimized after upload.</p>
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

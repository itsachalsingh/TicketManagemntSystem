
import { Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

interface Props {
    children: React.ReactNode;
}

const AdminLayout: React.FC<Props> = ({ children }) => {

    const user = usePage().props.auth.user;
    const { auth } = usePage().props as any;

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between">
                <div>
                    <div className="text-3xl font-bold p-6">Grievance Cell</div>
                    <nav className="space-y-2 px-6">
                        <Link href="/dashboard" className="block py-2 hover:text-gray-300">Dashboard</Link>
                        <Link href="/officers" className="block py-2 hover:text-gray-300">Officer Management</Link>
                        <Link href="/departments" className="block py-2 hover:text-gray-300">Departments</Link>
                        <Link href="/roles" className="block py-2 hover:text-gray-300">Roles & Permissions</Link>
                        <Link href="/settings" className="block py-2 hover:text-gray-300">Settings</Link>
                    </nav>
                </div>
                <div className="p-6 text-sm text-gray-400">© 2025 HRM Inc.</div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-black text-white flex justify-end px-6 py-4">
                    <div className="hidden sm:flex sm:items-center">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <span className="inline-flex rounded-md">
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                    >
                                        {user.name}
                                        <svg
                                            className="ms-2 h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </span>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profile
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                >
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 bg-white overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

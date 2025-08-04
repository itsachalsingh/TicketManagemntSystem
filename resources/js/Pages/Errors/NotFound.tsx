import React from 'react';
import { Link } from '@inertiajs/react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 sm:py-24">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-red-600 tracking-widest">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-gray-800">Page Not Found</h2>
        <p className="mt-2 text-gray-500">The page you’re looking for doesn’t exist or has been moved.</p>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-block px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-200"
          >
            ⟵ Back to Home
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <img
          src="/assets/404-illustration.svg"
          alt="Not Found"
          className="max-w-md w-full mx-auto"
        />
      </div>
    </div>
  );
};

export default NotFound;

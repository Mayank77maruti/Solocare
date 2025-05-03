"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

export default function RegisterPage() {
  const { user, loggedIn } = useAuth(); // Get user and loggedIn from context

  if (!loggedIn || !user?.email) {
    // Redirect to login if not logged in
    return (
      <div>
        Please log in to register. <Link href="/">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 flex flex-col items-center">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Registration Type</h2>
        <div className="space-y-4">
          <Link
            href="/norole/hospital"
            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
          >
            Register Hospital
          </Link>
          <Link
            href="/norole/doctor"
            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10"
          >
            Register as Doctor
          </Link>
          <Link
            href="/norole/patient"
            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 md:py-4 md:text-lg md:px-10"
          >
            Register as Patient
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";

import Navbar from '@/components/PagesUi/Navbar';
import { useEffect } from "react"; // Keep useEffect if needed for other purposes, otherwise remove
import Link from "next/link";
import { useRouter } from 'next/navigation'; // Keep if router is used elsewhere
import { useAuth } from '@/context/AuthContext'; // Import the useAuth hook

export default function Home() {
  const router = useRouter(); // Keep if needed
  const { login, logout, loggedIn, user, isLoading } = useAuth(); // Use the context

  // Hooks must be called unconditionally before any returns
  useEffect(() => {
    // Only perform the redirect logic *after* loading is complete and user is logged in
    if (!isLoading && loggedIn && user) {
      console.log("User logged in on Home page, redirecting:", user);
      router.push(`${user.role?.toLowerCase()}`);
    }
  }, [isLoading, loggedIn, user, router]);

  // Now, handle the loading state return *after* all hooks have been called
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to{' '}
            <span className="text-blue-600">Solocare</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Your trusted partner in healthcare management. Streamline your medical journey with our comprehensive platform.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            {loggedIn ? (
              <div className="flex space-x-4">
                <div className="rounded-md shadow">
                   {/* Link to onboarding or patient dashboard based on your flow */}
                  <Link
                    href='/patient' // Changed from /onboarding to match original redirect logic
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    Go to Dashboard
                  </Link>
                </div>
                <div className="rounded-md shadow">
                  <button
                    onClick={logout} // Add logout button
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-md shadow">
                <button
                  onClick={login} // Use login from context
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Login / Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-blue-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Pre-screening</h3>
            <p className="mt-2 text-base text-gray-500">
              Complete a quick pre-screening assessment before your appointment to help doctors better understand your condition.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-blue-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Medical Records</h3>
            <p className="mt-2 text-base text-gray-500">
              Access and manage your medical records securely in one place. Upload reports and view your health history.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-blue-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Appointment Management</h3>
            <p className="mt-2 text-base text-gray-500">
              Schedule and manage your appointments easily. Receive reminders and updates about your upcoming visits.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

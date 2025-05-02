'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  role?: 'patient' | 'doctor' | 'admin';
}

export default function Navbar({ role }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  if (!role) {
    // Landing page mode
    return (
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="text-xl font-bold text-blue-600">SoloCare</a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Login</a>
              <a href="/signup" className="text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 border border-blue-600">Sign Up</a>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const adminLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/doctors', label: 'Doctors' },
    { href: '/admin/patients', label: 'Patients' },
  ];

  const doctorLinks = [
    { href: '/doctor', label: 'Dashboard' },
  ];

  const patientLinks = [
    { href: '/patient', label: 'Dashboard' },
    { href: '/patient/reports', label: 'Reports' },
    { href: '/patient/chat', label: 'Chat' },
  ];

  const links = role === 'admin' 
    ? adminLinks 
    : role === 'doctor' 
    ? doctorLinks 
    : patientLinks;

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={`/${role}`} className="text-xl font-bold text-blue-600">
                SoloCare
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${
                    isActive(link.href)
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 
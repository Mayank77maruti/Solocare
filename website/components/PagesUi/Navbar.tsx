'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react'; // Keep useState if needed for other state, remove useEffect
// Remove Web3Auth imports if no longer needed directly here
// import { Web3Auth } from "@web3auth/modal";
// import { CHAIN_NAMESPACES, IProvider, UX_MODE, WALLET_ADAPTERS, WEB3AUTH_NETWORK, getSolanaChainConfig } from "@web3auth/base";
// import { AuthAdapter, WHITE_LABEL_THEME, WhiteLabelData } from "@web3auth/auth-adapter";
// import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { useRouter } from 'next/navigation'; // Keep if used for navigation
import { useAuth } from '@/context/AuthContext'; // Import the useAuth hook

interface NavbarProps {
  role?: 'patient' | 'doctor' | 'admin';
}

// Remove clientId constant

export default function Navbar({ role }: NavbarProps) {
  const router = useRouter(); // Keep if used
  const { login, logout, loggedIn, isLoading, user } = useAuth(); // Use context
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Determine the correct dashboard link based on role or user data if available
  // This part might need refinement based on how role is determined post-login
  const dashboardHref = role ? `/${role}` : (user?.email ? '/patient' : '/'); // Default to /patient if logged in but no role prop
  // Loading state from context
  if (isLoading) {
    // Optional: Render a minimal loading state for the navbar buttons
    return (
       <nav className="bg-white shadow">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex justify-between h-16">
             <div className="flex-shrink-0 flex items-center">
               <Link href="/" className="text-xl font-bold text-blue-600">SoloCare</Link>
             </div>
             <div className="flex items-center space-x-4">
                <div className="animate-pulse bg-gray-300 h-8 w-20 rounded-md"></div>
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
    { href: '/patient/appointments', label: 'Appointments' },
  ];

  const links = role === 'admin' 
    ? adminLinks 
    : role === 'doctor' 
    ? doctorLinks 
    : patientLinks;

  // Remove local logout function, useEffect, chainConfig

  // Render logic using context state
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {/* Link to dashboard or home based on login status */}
              <Link href={loggedIn ? dashboardHref : '/'} className="text-xl font-bold text-blue-600">
                SoloCare
              </Link>
            </div>
            {/* Show role-specific links only if logged in and role is provided */}
            {loggedIn && role && (
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
            )}
            {/* <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
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
            </div> */}
          </div>
          <div className="flex items-center">
            {/* Conditional Login/Logout Button */}
            {loggedIn ? (
               <button
                 type="button"
                 className="bg-red-600 cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                 onClick={logout} // Use logout from context
               >
                 Logout
               </button>
             ) : (
               <button
                 type="button"
                 className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                 onClick={login} // Use login from context
               >
                 Login
               </button>
             )}
          </div>
        </div>
      </div>
    </nav>
  );
} 
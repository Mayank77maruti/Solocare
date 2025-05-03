"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RoleName } from '@prisma/client'; // Import RoleName

export default function HospitalRegistrationPage() {
  const [hospitalName, setHospitalName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email) {
      setError("User not logged in.");
      return;
    }

    try {
      // First, assign the role
      const roleResponse = await fetch('/api/auth/assign-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          role: RoleName.ADMIN,
        }),
      });

      if (!roleResponse.ok) {
        const roleData = await roleResponse.json();
        setError(roleData.message || 'Failed to assign role.');
        console.error('Role assignment failed:', roleData);
        return;
      }

      // Then, save hospital details
      const hospitalResponse = await fetch('/api/hospital', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hospitalName: hospitalName,
          address: address,
          city: city,
          state: state,
          zipCode: zipCode,
          country: country,
          adminEmail:user.email
        }),
      });

      if (hospitalResponse.ok) {
        setSuccess(true);
        router.push('/admin');
      } else {
        const hospitalData = await hospitalResponse.json();
        setError(hospitalData.message || 'Failed to save hospital details.');
        console.error('Hospital details save failed:', hospitalData);
      }
    } catch (error) {
      setError('An unexpected error occurred.');
      console.error('Error assigning role:', error);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 flex flex-col items-center">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-bold text-green-600 mb-6">Registration Successful!</h2>
          <p>You have been registered as a hospital administrator. You will be redirected to the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 flex flex-col items-center">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Register Your Hospital</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700">
              Hospital Name
            </label>
            <input
              type="text"
              id="hospitalName"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              type="text"
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
              Zip Code
            </label>
            <input
              type="text"
              id="zipCode"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
            >
              Register Hospital
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RoleName } from '@prisma/client'; // Import RoleName

interface PatientDetails {
  name: string;
  phone: string;
}

export default function PatientRegistrationPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({ name: '', phone: '' });
  const router = useRouter();
  const { user } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientDetails({ ...patientDetails, [e.target.name]: e.target.value });
  };

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
          role: RoleName.PATIENT,
        }),
      });

      if (!roleResponse.ok) {
        const roleData = await roleResponse.json();
        setError(roleData.message || 'Failed to assign role.');
        console.error('Role assignment failed:', roleData);
        return;
      }

      // Then, save patient details
      const patientResponse = await fetch('/api/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: patientDetails.name,
          email: user.email,
          phone: patientDetails.phone,
        }),
      });

      if (patientResponse.ok) {
        setSuccess(true);
        router.push('/patient');
      } else {
        const patientData = await patientResponse.json();
        setError(patientData.message || 'Failed to save patient details.');
        console.error('Patient details save failed:', patientData);
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
          <p>You have been registered as a patient. You will be redirected to the patient dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 flex flex-col items-center">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Register as a Patient</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={patientDetails.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={patientDetails.phone}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
            >
              Register as Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
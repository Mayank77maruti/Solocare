"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RoleName } from '@prisma/client'; // Import RoleName

interface DoctorDetails {
  name: string;
  email: string;
  hospitalId?: string; // Add hospitalId
}

export default function DoctorRegistrationPage() {
  const [specialty, setSpecialty] = useState('');
  const [doctorDetails, setDoctorDetails] = useState<DoctorDetails>({ name: '', email: '' });
  const [hospitalId, setHospitalId] = useState(''); // Add hospitalId state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDoctorDetails({ ...doctorDetails, [e.target.name]: e.target.value });
  };

  const handleHospitalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Add handleHospitalIdChange
    setHospitalId(e.target.value);
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
          role: RoleName.DOCTOR,
        }),
      });

      if (!roleResponse.ok) {
        const roleData = await roleResponse.json();
        setError(roleData.message || 'Failed to assign role.');
        console.error('Role assignment failed:', roleData);
        return;
      }

      // Then, save doctor details
      const doctorResponse = await fetch('/api/doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: doctorDetails.name,
          email: user.email,
          specialty: specialty,
          hospitalId: hospitalId, // Include hospitalId
        }),
      });

      if (doctorResponse.ok) {
        setSuccess(true);
        router.push('/doctor');
      } else {
        const doctorData = await doctorResponse.json();
        setError(doctorData.message || 'Failed to save doctor details.');
        console.error('Doctor details save failed:', doctorData);
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
          <p>You have been registered as a doctor. You will be redirected to the doctor dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 flex flex-col items-center">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Register as a Doctor</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={doctorDetails.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={doctorDetails.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
              Specialty
            </label>
            <input
              type="text"
              id="specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="hospitalId" className="block text-sm font-medium text-gray-700">Hospital ID</label>  {/* Add hospitalId input */}
            <input
              type="text"
              name="hospitalId"
              id="hospitalId"
              value={hospitalId}
              onChange={handleHospitalIdChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
            >
              Register as Doctor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
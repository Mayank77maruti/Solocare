"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/PagesUi/Navbar';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const HospitalDetails = () => {
  const router = useRouter();
  const params = useParams();
  const hospitalId = params.hospitalId;
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    patientName: '',
    patientAge: '',
    patientGender: '',
    patientEmail: '',
    patientPhone: '',
  });
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchHospital = async () => {
      if (!hospitalId) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/hospital/${hospitalId}`);
        const data = await response.json();
        if (data.success) {
          setHospital(data.data);
        } else {
          setError(data?.message || 'Failed to fetch hospital details.');
        }
      } catch (err: any) {
        setError(err?.message || 'An error occurred while fetching hospital details.');
      } finally {
        setLoading(false);
      }
    };

    fetchHospital();
    const fetchPatientId = async () => {
      if (!user?.email) {
        return;
      }
      try {
        const patientIdResponse = await fetch(`/api/patient?email=${user.email}`);
        const patientIdData = await patientIdResponse.json();
        if (patientIdData.success && patientIdData.patientId) {
          setPatientId(patientIdData.patientId);
        } else {
          setError(patientIdData.message || 'Failed to retrieve patient ID');
        }
      } catch (error: any) {
        setError(error?.message || 'An error occurred while fetching patient details.');
      }
    };
    fetchPatientId();
  }, [hospitalId, user?.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!patientId) {
      setFormError('Patient ID not found. Please log in again.');
      return;
    }
    try {
      const response = await fetch('/api/appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, hospitalId, patientId }),
      });

      const data = await response.json();

      if (data.success) {
        setFormSuccess(true);
        setFormData({
          scheduledDate: '',
          scheduledTime: '',
          patientName: '',
          patientAge: '',
          patientGender: '',
          patientEmail: '',
          patientPhone: '',
        });
        router.push(`/patient/appointments/${data.appointmentId}`);
      } else {
        setFormError(data.message || 'Failed to request appointment.');
      }
    } catch (error: any) {
      setFormError(error?.message || 'An error occurred while requesting the appointment.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hospital && (
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            {hospital.name}
          </h1>
        )}

        {loading && <p>Loading hospital details...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {formSuccess && <p className="text-green-500">Appointment requested successfully!</p>}
        {formError && <p className="text-red-500">Error: {formError}</p>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">Scheduled Date</label>
            <input
              type="date"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700">Scheduled Time</label>
            <input
              type="time"
              id="scheduledTime"
              name="scheduledTime"
              value={formData.scheduledTime}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">Patient Name</label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label htmlFor="patientAge" className="block text-sm font-medium text-gray-700">Patient Age</label>
            <input
              type="number"
              id="patientAge"
              name="patientAge"
              value={formData.patientAge}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label htmlFor="patientGender" className="block text-sm font-medium text-gray-700">Patient Gender</label>
            <select
              id="patientGender"
              name="patientGender"
              value={formData.patientGender}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="patientEmail" className="block text-sm font-medium text-gray-700">Patient Email</label>
            <input
              type="email"
              id="patientEmail"
              name="patientEmail"
              value={formData.patientEmail}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label htmlFor="patientPhone" className="block text-sm font-medium text-gray-700">Patient Phone</label>
            <input
              type="tel"
              id="patientPhone"
              name="patientPhone"
              value={formData.patientPhone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Request Appointment
          </button>
        </form>
      </main>
    </div>
  );
};

export default HospitalDetails;
"use client";

import { useAuth } from '@/context/AuthContext';
import React, { useState, useEffect } from 'react';
import { mockAppointments } from '@/lib/mockData'; // Assuming you have mock data
import { useRouter } from 'next/navigation';

interface Appointment {
  id: string;
  patientName: string;
  scheduledTime: Date | null;
}

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user?.email) {
          setError('User not logged in');
          setLoading(false);
          return;
        }

        // Fetch patientId from the database using user email
        const patientIdResponse = await fetch(`/api/patient?email=${user.email}`);
        const patientIdData = await patientIdResponse.json();

        if (!patientIdData.success || !patientIdData.patientId) {
          setError(patientIdData.message || 'Failed to retrieve patient ID');
          setLoading(false);
          return;
        }
        console.log(patientIdData);

        const patientId = patientIdData.patientId;

        const response = await fetch(`/api/appointment/getAppointments?patientId=${patientId}`);
        const data = await response.json();

        if (data.success) {
          setAppointments(data.appointments as Appointment[]);
        } else {
          setError(data.message || 'Failed to fetch appointments');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user?.email]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading appointments...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Appointments</h1>
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => router.push('/patient/hospitals')}
        >
          New Appointment
        </button>
      </div>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => router.push(`/patient/appointments/${appointment.id}`)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">
                  Appointment with Patient: {appointment.patientName}
                </p>
                <p className="text-sm text-gray-500">
                  {appointment.scheduledTime ? new Date(appointment.scheduledTime).toLocaleString() : 'No date'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentsPage;
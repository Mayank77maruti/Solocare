"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/PagesUi/Navbar';

interface Appointment {
  id: string;
  patientName: string;
  scheduledTime: string | null;
  patientAge: number;
  patientGender: string;
  patientEmail: string;
  patientPhone: string;
  // Add other appointment details here
}

const AppointmentDetailsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/appointment/${appointmentId}`);
        const data = await response.json();
        console.log(data);

        if (data.success) {
          setAppointment(data.appointment);
        } else {
          setError(data.message || 'Failed to fetch appointment details.');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching appointment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const handleConfirmAppointment = async () => {
    if (!appointmentId) return;
    try {
      const response = await fetch('/api/appointment/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentId }),
      });

      const data = await response.json();

      if (data.success) {
        // Optionally, refresh the appointment details or redirect
        router.refresh(); // Refreshes the current route
      } else {
        setError(data.message || 'Failed to confirm appointment.');
      }
    } catch (error: any) {
      setError(error?.message || 'An error occurred while confirming the appointment.');
    }
  };

  if (loading) {
    return (
      <div>

        <main className="container mx-auto p-4">Loading appointment details...</main>
      </div>
    );
  }

  if (error) {
    return (
      <div>

        <main className="container mx-auto p-4">Error: {error}</main>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div>

        <main className="container mx-auto p-4">Appointment not found.</main>
      </div>
    );
  }

  return (
    <div>
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Appointment Details</h1>
        <div className="mb-4">
          <p>Patient Name: {appointment.patientName}</p>
          <p>Scheduled Time: {appointment.scheduledTime ? new Date(appointment.scheduledTime).toLocaleString() : 'Not scheduled'}</p>
          <p>Age: {appointment.patientAge}</p>
          <p>Gender: {appointment.patientGender}</p>
          <p>Email: {appointment.patientEmail}</p>
          <p>Phone: {appointment.patientPhone}</p>
          {/* Display other appointment details */}
        </div>
        <div className="flex space-x-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => router.push(`/patient/prescreening/${appointmentId}`)}
          >
            Pre-screen
          </button>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleConfirmAppointment}
          >
            Confirm Appointment
          </button>
        </div>
      </main>
    </div>
  );
};

export default AppointmentDetailsPage;
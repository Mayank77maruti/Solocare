"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/PagesUi/Navbar';

interface Appointment {
  id: string;
}

const AppointmentDetailsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrescreeningDone, setIsPrescreeningDone] = useState(false);

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

  useEffect(() => {
    // Check if pre-screening is done for this appointment
    const prescreeningStatus = localStorage.getItem(`prescreening_done_${appointmentId}`);
    setIsPrescreeningDone(prescreeningStatus === 'true');
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
        router.refresh();
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
          <p>Appointment ID: {appointment.id}</p>
        </div>
        <div className="flex space-x-4">
          {isPrescreeningDone ? (
            <div className="px-6 py-3 bg-green-100 text-green-800 font-semibold rounded-full">
              Pre-screening Done
            </div>
          ) : (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => router.push(`/patient/appointments/${appointmentId}/aiscreening`)}
            >
              Pre-screen
            </button>
          )}
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
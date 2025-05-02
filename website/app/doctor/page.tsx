'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/PagesUi/Navbar';
import { mockAppointments, mockReports } from '@/lib/mockData';
import { useState } from 'react';

export default function DoctorDashboard() {
  const router = useRouter();
  const [status, setStatus] = useState<'Active' | 'Away'>('Active');
  
  // Filter today's appointments
  const todayAppointments = mockAppointments.filter(
    (appointment) => appointment.date === '2024-05-01'
  );

  // Count patients in queue (status: scheduled)
  const patientsInQueue = todayAppointments.filter(a => a.status === 'scheduled').length;

  const handleRowClick = (patientId: string) => {
    router.push(`/doctor/patient/${patientId}`);
  };

  const handleStartConsulting = (patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/doctor/patient/${patientId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="doctor" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-gray-900">Today's Patient Queue</h1>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{status}</span>
              <button
                type="button"
                onClick={() => setStatus(status === 'Active' ? 'Away' : 'Active')}
                className="ml-2 px-3 py-1 border border-gray-300 rounded text-xs font-medium bg-white hover:bg-gray-50"
              >
                Set {status === 'Active' ? 'Away' : 'Active'}
              </button>
            </div>
            <div className="ml-6 text-sm text-gray-700">
              Patients in queue: <span className="font-bold">{patientsInQueue}</span>
            </div>
          </div>
          <div className="flex space-x-4">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Export
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayAppointments.map((appointment) => {
                  // Status: In Queue if scheduled, Done if completed/cancelled
                  const patientStatus = appointment.status === 'scheduled' ? 'In Queue' : 'Done';
                  return (
                    <tr 
                      key={appointment.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(appointment.patientId)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.patientId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${patientStatus === 'In Queue' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{patientStatus}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          onClick={(e) => handleStartConsulting(appointment.patientId, e)}
                        >
                          Start Consulting
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {todayAppointments.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments today</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any appointments scheduled for today.
            </p>
          </div>
        )}
      </main>
    </div>
  );
} 
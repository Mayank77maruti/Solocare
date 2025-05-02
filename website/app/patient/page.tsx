'use client';

import { useState } from 'react';
import Navbar from '@/components/PagesUi/Navbar';
import FileUpload from '@/components/PagesUi/FileUpload';
import { mockAppointments } from '@/lib/mockData';

export default function PatientDashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // In a real application, you would upload the file here
    console.log('Selected file:', file.name);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="patient" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Patient Dashboard</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Appointments</h2>
            <div className="space-y-4">
              {mockAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">Appointment with Dr. {appointment.doctorId}</p>
                      <p className="text-sm text-gray-500">{appointment.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{appointment.date}</p>
                      <p className="text-sm text-gray-500">{appointment.time}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Medical Reports */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Medical Reports</h2>
            <FileUpload onFileSelect={handleFileSelect} accept=".pdf,.jpg,.png" />
            {selectedFile && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  Selected file: {selectedFile.name}
                </p>
                <button
                  className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Upload Report
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 
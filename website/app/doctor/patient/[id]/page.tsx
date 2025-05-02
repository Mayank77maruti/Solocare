'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/PagesUi/Navbar';
import { mockPatients, mockReports } from '@/lib/mockData';

export default function PatientDetail() {
  const params = useParams();
  const patientId = params.id as string;
  
  const [prescription, setPrescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const patient = mockPatients.find(p => p.id === patientId);
  const patientReports = mockReports.filter(r => r.patientId === patientId);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    console.log('Selected file:', file.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would save the prescription here
    console.log('New prescription:', {
      text: prescription,
      file: selectedFile?.name,
    });
    setPrescription('');
    setSelectedFile(null);
  };

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar role="doctor" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Patient not found</h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="doctor" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Patient Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Patient Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{patient.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <p className="mt-1 text-sm text-gray-900">{patient.age}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <p className="mt-1 text-sm text-gray-900">{patient.gender}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{patient.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{patient.phone}</p>
              </div>
            </div>
          </div>

          {/* Pre-screening Report */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pre-screening Report</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Symptoms</label>
                <p className="mt-1 text-sm text-gray-900">
                  {patient.symptoms || 'No symptoms reported'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Severity</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  patient.severity === 'High' ? 'bg-red-100 text-red-800' :
                  patient.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {patient.severity}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Suggested Department</label>
                <p className="mt-1 text-sm text-gray-900">{patient.suggestedDepartment}</p>
              </div>
            </div>
          </div>

          {/* Past Reports */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Past Reports</h2>
            <div className="space-y-4">
              {patientReports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{report.type}</h3>
                      <p className="text-sm text-gray-500">{report.date}</p>
                    </div>
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      View Report
                    </a>
                  </div>
                </div>
              ))}
              {patientReports.length === 0 && (
                <p className="text-sm text-gray-500">No past reports available</p>
              )}
            </div>
          </div>

          {/* Prescription Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Prescription</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prescription Details
                </label>
                <textarea
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter prescription details..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Attach Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Prescription
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 
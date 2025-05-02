'use client';

import Navbar from '@/components/PagesUi/Navbar';
import ReportCard from '@/components/PagesUi/ReportCard';
import { mockReports } from '@/lib/mockData';

export default function PatientReports() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="patient" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Medical Reports</h1>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            Request New Report
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {mockReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              showDoctorInfo={true}
            />
          ))}
        </div>

        {mockReports.length === 0 && (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't received any medical reports yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
} 
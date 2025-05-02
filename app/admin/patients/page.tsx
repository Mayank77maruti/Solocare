'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/PagesUi/Navbar';
import { mockPatients, mockDoctors } from '@/lib/mockData';

export default function PatientsManager() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [queueNumbers, setQueueNumbers] = useState<Record<string, number>>({});
  const [editingQueue, setEditingQueue] = useState<string | null>(null);
  const [confirmedQueues, setConfirmedQueues] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [selections, setSelections] = useState<Record<string, {
    department: string;
    doctorId: string;
    queueNo: number;
    confirmed: boolean;
  }>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRowClick = (patientId: string) => {
    router.push(`/admin/patient/${patientId}`);
  };

  const handleQueueClick = (patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingQueue(patientId);
  };

  const handleQueueChange = (patientId: string, value: string) => {
    const number = parseInt(value);
    if (!isNaN(number) && number > 0) {
      setQueueNumbers({ ...queueNumbers, [patientId]: number });
    }
  };

  const handleQueueConfirm = (patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (queueNumbers[patientId]) {
      setConfirmedQueues({ ...confirmedQueues, [patientId]: true });
      setEditingQueue(null);
    }
  };

  const handleDepartmentChange = (patientId: string, value: string) => {
    setSelections((prev) => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        department: value,
        doctorId: '', // reset doctor if department changes
      },
    }));
  };

  const handleDoctorChange = (patientId: string, value: string) => {
    setSelections((prev) => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        doctorId: value,
      },
    }));
  };

  const handleQueueNoChange = (patientId: string, value: string) => {
    const number = parseInt(value);
    setSelections((prev) => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        queueNo: !isNaN(number) && number > 0 ? number : 0,
      },
    }));
  };

  const handleConfirm = (patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelections((prev) => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        confirmed: true,
      },
    }));
  };

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="admin" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-900">PATIENTS MANAGER</h1>
       
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
             
                <button 
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
                >
                  Patients list
                </button>
              
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    First Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Queue No.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => {
                  const [firstName, ...lastNameParts] = patient.name.split(' ');
                  const lastName = lastNameParts.join(' ');
                  const patientSelection = selections[patient.id] || {};
                  const departmentOptions = [
                    patient.suggestedDepartment,
                    ...mockDoctors.map((d) => d.department).filter((dep, i, arr) => dep && dep !== patient.suggestedDepartment && arr.indexOf(dep) === i),
                  ];
                  const doctorOptions = mockDoctors.filter(
                    (doc) => doc.department === patientSelection.department || (!patientSelection.department && doc.department === patient.suggestedDepartment)
                  );
                  const canConfirm = patientSelection.department && patientSelection.doctorId && patientSelection.queueNo > 0 && !patientSelection.confirmed;
                  return (
                    <tr
                      key={patient.id}
                      onClick={() => handleRowClick(patient.id)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded-full" src={`https://ui-avatars.com/api/?name=${firstName}&background=random`} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{firstName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lastName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          patientSelection.confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {patientSelection.confirmed ? 'In Queue' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          patient.severity === 'High' ? 'bg-red-100 text-red-800' :
                          patient.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {patient.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={patientSelection.department || patient.suggestedDepartment || ''}
                          onChange={(e) => handleDepartmentChange(patient.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={patientSelection.confirmed}
                        >
                          {departmentOptions.map((dep) => (
                            <option key={dep} value={dep}>{dep}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={patientSelection.doctorId || ''}
                          onChange={(e) => handleDoctorChange(patient.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={patientSelection.confirmed}
                        >
                          <option value="">Select Doctor</option>
                          {doctorOptions.map((doc) => (
                            <option key={doc.id} value={doc.id}>{doc.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          min="1"
                          value={patientSelection.queueNo || ''}
                          onChange={(e) => handleQueueNoChange(patient.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={patientSelection.confirmed}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={(e) => handleConfirm(patient.id, e)}
                          disabled={!canConfirm}
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
                            !canConfirm
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'text-white bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {patientSelection.confirmed ? 'Confirmed' : 'Confirm'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Total patients: <span className="font-medium">{filteredPatients.length}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
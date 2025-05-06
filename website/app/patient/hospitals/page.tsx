"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/PagesUi/Navbar';
// import {  } from '@/app/api/hospital/route';

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  // Add other hospital details as needed
}

const HospitalSelection = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null); // Store the selected hospital ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);

  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/hospital');
        const data = await response.json();
        if (data.success) {
          setHospitals(data.data);
        } else {
          setError(data?.message || 'Failed to fetch hospitals.');
        }
      } catch (err: any) {
        setError(err?.message || 'An error occurred while fetching hospitals.');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  useEffect(() => {
    if (hospitals) {
      const filtered = hospitals.filter(hospital => {
        const cityMatch = hospital.city.toLowerCase().includes(cityFilter.toLowerCase());
        const stateMatch = hospital.state.toLowerCase().includes(stateFilter.toLowerCase());
        return cityMatch && stateMatch;
      });
      setFilteredHospitals(filtered);
    }
  }, [hospitals, cityFilter, stateFilter]);

  const handleHospitalSelect = (hospitalId: string) => {
    setSelectedHospital(hospitalId);
    // You can add navigation or further actions here, e.g.,
    // navigate(`/patient/appointments?hospitalId=${hospitalId}`);
    console.log("Selected hospital:", hospitalId);
    window.location.href = `/patient/hospitals/${hospitalId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Select Hospital
        </h1>

        <div className="mb-4">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            id="city"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
          <input
            type="text"
            id="state"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>

        {loading && <p>Loading hospitals...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <div className="space-y-4">
            {filteredHospitals.map((hospital) => (
              <div
                key={hospital.id}
                className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedHospital === hospital.id ? 'bg-blue-100' : ''
                }`}
                onClick={() => handleHospitalSelect(hospital.id)}
              >
                <h3 className="font-medium text-lg text-gray-900">
                  {hospital.name}
                </h3>
                <p className="text-gray-500">{hospital.address}</p>
                {/* Display other hospital details here */}
              </div>
            ))}
          </div>
        )}

        {selectedHospital && (
          <div className="mt-8">
            <p>Selected Hospital ID: {selectedHospital}</p>
            {/* Add a button to proceed to the next step (e.g., appointments) */}
          </div>
        )}
      </main>
    </div>
  );
};

export default HospitalSelection;
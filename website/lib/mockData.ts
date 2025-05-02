export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  medicalHistory: string[];
  symptoms?: string;
  severity?: 'High' | 'Medium' | 'Low';
  suggestedDepartment?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  email: string;
  phone: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  department: string;
}

export interface Report {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  type: 'pre-screening' | 'prescription' | 'medical';
  severity: 'low' | 'medium' | 'high';
  content: string;
  attachments?: string[];
}

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    age: 35,
    gender: 'Male',
    medicalHistory: ['Hypertension', 'Diabetes'],
    symptoms: 'Chest pain and shortness of breath',
    severity: 'High',
    suggestedDepartment: 'Cardiology'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1987654321',
    age: 28,
    gender: 'Female',
    medicalHistory: ['Asthma'],
    symptoms: 'Persistent headache and dizziness',
    severity: 'Medium',
    suggestedDepartment: 'Neurology'
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    phone: '+1 234 567 8903',
    age: 45,
    gender: 'Male',
    medicalHistory: [],
    symptoms: 'Fever and cough',
    severity: 'Low',
    suggestedDepartment: 'General Medicine'
  }
];

export const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialization: 'Cardiology',
    department: 'Cardiology',
    email: 'sarah@solocare.com',
    phone: '+1234567890',
    available: true
  },
  {
    id: '2',
    name: 'Dr. Michael Brown',
    specialization: 'Neurology',
    department: 'Neurology',
    email: 'michael@solocare.com',
    phone: '+1987654321',
    available: true
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '1',
    date: '2024-05-01',
    time: '10:00 AM',
    status: 'scheduled',
    department: 'Cardiology'
  },
  {
    id: '2',
    patientId: '2',
    doctorId: '2',
    date: '2024-05-01',
    time: '11:00 AM',
    status: 'scheduled',
    department: 'Neurology'
  }
];

export const mockReports: Report[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '1',
    date: '2024-04-30',
    type: 'pre-screening',
    severity: 'medium',
    content: 'Patient reported chest pain and shortness of breath. Recommended follow-up with cardiologist.',
    attachments: ['report1.pdf']
  },
  {
    id: '2',
    patientId: '2',
    doctorId: '2',
    date: '2024-04-29',
    type: 'prescription',
    severity: 'low',
    content: 'Prescribed medication for migraine management.',
    attachments: ['prescription2.pdf']
  }
]; 
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    if (!body.patientId || !body.scheduledDate || !body.scheduledTime || !body.patientName || !body.patientAge || !body.patientGender || !body.patientEmail || !body.patientPhone || !body.hospitalId) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Combine date and time
    const scheduledDateTime = new Date(`${body.scheduledDate}T${body.scheduledTime}:00`);

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: body.patientId,
        scheduledTime: scheduledDateTime,
        patientName: body.patientName,
        patientAge: parseInt(body.patientAge, 10),
        patientGender: body.patientGender,
        patientEmail: body.patientEmail,
        patientPhone: body.patientPhone,
        hospitalId: body.hospitalId,
      },
    });

    return NextResponse.json({ success: true, message: 'Appointment created successfully', appointmentId: appointment.id }, { status: 201 });

  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ success: false, message: 'Failed to create appointment' }, { status: 500 });
  }
}
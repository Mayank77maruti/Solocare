import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json({ message: 'Appointment ID is required' }, { status: 400 });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { submit: true },
    });

    if (!updatedAppointment) {
      return NextResponse.json({ message: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Appointment confirmed successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error confirming appointment:', error);
    return NextResponse.json({ success: false, message: 'Failed to confirm appointment' }, { status: 500 });
  }
}
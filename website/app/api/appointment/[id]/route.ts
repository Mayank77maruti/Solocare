import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: 'Appointment ID is required' }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json({ message: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, appointment }, { status: 200 });

  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch appointment' }, { status: 500 });
  }
}
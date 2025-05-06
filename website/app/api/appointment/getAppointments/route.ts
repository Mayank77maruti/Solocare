import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ message: 'patientId is required' }, { status: 400 });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: patientId,
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });

    return NextResponse.json({ success: true, appointments }, { status: 200 });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch appointments' }, { status: 500 });
  }
}
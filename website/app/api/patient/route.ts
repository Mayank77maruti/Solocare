import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PatientDetails {
  name: string;
  email: string;
  phone: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PatientDetails = await request.json();

    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json({ message: 'Name, email, and phone are required' }, { status: 400 });
    }

    // Assuming the user is already created and has a role
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    await prisma.patient.create({
      data: {
        userId: user.id,
        name: body.name,
        email: body.email,
        phone: body.phone,
      },
    });

    return NextResponse.json({ message: 'Patient details saved successfully' });

  } catch (error) {
    console.error('Patient API error:', error);
    return NextResponse.json({ message: 'Failed to save patient details' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        patient: true,
      },
    });

    if (!user || !user.patient) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, patientId: user.patient.id }, { status: 200 });

  } catch (error) {
    console.error('Error fetching patient ID:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch patient ID' }, { status: 500 });
  }
}
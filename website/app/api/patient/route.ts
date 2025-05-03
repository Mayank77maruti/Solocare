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
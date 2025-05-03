import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DoctorDetails {
  name: string;
  email: string;
  specialty: string;
  hospitalId?: string; // Add hospitalId
}

export async function POST(request: NextRequest) {
  try {
    const body: DoctorDetails = await request.json();

    if (!body.name || !body.email || !body.specialty) {
      return NextResponse.json({ message: 'Name, email, and specialty are required' }, { status: 400 });
    }
    // Validate hospitalId
    if (body.hospitalId) {
      const hospital = await prisma.hospital.findUnique({
        where: { id: body.hospitalId },
      });
      if (!hospital) {
        return NextResponse.json({ message: 'Invalid hospitalId' }, { status: 400 });
      }
    }

    // Assuming the user is already created and has a role
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    await prisma.doctor.create({
      data: {
        userId: user.id,
        name: body.name,
        email: body.email,
        specialty: body.specialty,
        hospitalId: body.hospitalId, // Include hospitalId
      },
    });

    return NextResponse.json({ message: 'Doctor details saved successfully' });

  } catch (error) {
    console.error('Doctor API error:', error);
    return NextResponse.json({ message: 'Failed to save doctor details' }, { status: 500 });
  }
}
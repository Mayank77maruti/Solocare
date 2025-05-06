import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, RoleName } from '@prisma/client';

const prisma = new PrismaClient();

interface HospitalDetails {
  hospitalName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  adminEmail: string; // Add adminEmail
}

export async function GET(request: NextRequest) {
  try {
    const hospitals = await prisma.hospital.findMany();
    return NextResponse.json({ success: true, data: hospitals });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch hospitals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: HospitalDetails = await request.json();

    if (!body.hospitalName || !body.address || !body.city || !body.state || !body.zipCode || !body.country || !body.adminEmail) { // Add adminEmail check
      return NextResponse.json({ message: 'All hospital and admin details are required' }, { status: 400 });
    }

    // Create the hospital
    const hospital = await prisma.hospital.create({
      data: {
        name: body.hospitalName,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        country: body.country,
      },
    });

    // Create the admin user
    const adminUser = await prisma.user.upsert({ // Use upsert to avoid errors if the user already exists
      where: { email: body.adminEmail },
      update: {
        role: RoleName.ADMIN,
      },
      create: {
        email: body.adminEmail,
        role: RoleName.ADMIN,
      },
    });

    // Create the admin record
    await prisma.admin.create({
      data: {
        userId: adminUser.id,
        name: body.hospitalName, // You can customize the admin name
        email: body.adminEmail,
        hospitalId: hospital.id,
      },
    });

    return NextResponse.json({ message: 'Hospital and admin details saved successfully', hospitalId: hospital.id, adminEmail: body.adminEmail });

  } catch (error) {
    console.error('Hospital API error:', error);
    return NextResponse.json({ message: 'Failed to save hospital details' }, { status: 500 });
  }
}
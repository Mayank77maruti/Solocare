import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const p =await params;
  const hospitalId = await p.id;

  try {
    const hospital = await prisma.hospital.findUnique({
      where: {
        id: hospitalId,
      },
    });

    if (!hospital) {
      return NextResponse.json({ success: false, message: 'Hospital not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: hospital });
  } catch (error) {
    console.error('Error fetching hospital details:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch hospital details' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { RoleName } from '@prisma/client'; // Import RoleName

const prisma = new PrismaClient();

interface AssignRoleRequestBody {
  email: string;
  role: RoleName;
}

export async function POST(request: NextRequest) {
  try {
    const body: AssignRoleRequestBody = await request.json();

    if (!body.email || !body.role) {
      return NextResponse.json({ message: 'Email and role are required' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email: body.email },
      data: {
        role: body.role,
      },
    });

    console.log('Role assigned successfully:', user);
    return NextResponse.json({ message: 'Role assigned successfully' });

  } catch (error) {
    console.error('Assign Role API error:', error);
    return NextResponse.json({ message: 'Failed to assign role' }, { status: 500 });
  }
}
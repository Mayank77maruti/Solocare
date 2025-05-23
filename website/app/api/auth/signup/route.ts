import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client'

const client = new PrismaClient();

export async function POST(req: NextRequest) {
    const body = await req.json();
    try {
        const { email } = body;

        const existingUser = await client.user.findUnique({
            where: {
                email: email
            }
        });

        if (existingUser) {
            return NextResponse.json({
                success: false,
                message: "User already exists"
            });
        }

        const role = await client.role.findUnique({
            where: {
                name: 'PATIENT'
            }
        });

        if (!role) {
            return NextResponse.json({
                success: false,
                message: "Role not found"
            })
        }

        const newUser = await client.user.create({
            data: {
                email: email,
                roleId: role.id
            }
        });

        return NextResponse.json({
            user: newUser,
            success: true,
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
        });
    }
}
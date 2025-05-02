import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client'

const client = new PrismaClient();

export async function PUT(req: NextRequest) {
    const body = await req.json();
    try {
        const { email, firstName, lastName } = body;

        const existingUser = await client.user.findUnique({
            where: {
                email: email
            }
        });

        if (!existingUser) {
            return NextResponse.json({
                success: false,
                message: "User does not exist"
            });
        }

        const updatedUser = await client.user.update({
            where: {
                email: email
            },
            data: {
                firstname: firstName,
                lastname: lastName
            }
        });

        return NextResponse.json({
            updatedUser: updatedUser,
            success: true,
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            // @ts-ignore
            message: `Error saving dataAccount: ${error.message}`
        });
    }
}
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client'

const client = new PrismaClient();

export async function PUT(req: NextRequest) {
    const body = await req.json();
    try {
        const { email, encryptionKey } = body;

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
                encryptionKey: encryptionKey
            }
        });

        return NextResponse.json({
            encryptionKey: encryptionKey,
            success: true,
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            // @ts-ignore
            message: `Error saving encryption key: ${error.message}`
        });
    }
}
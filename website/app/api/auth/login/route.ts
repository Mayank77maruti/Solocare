// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session'; // Keep standard import
import { sessionOptions, SessionData } from '@/lib/session'; // Import config and type
import { cookies } from 'next/headers'; // Import cookies from next/headers for App Router
import { PrismaClient } from '@prisma/client'; // Import Prisma Client

const prisma = new PrismaClient(); // Instantiate Prisma Client

// Define the expected request body shape
interface LoginRequestBody {
  email?: string;
  name?: string;
  profileImage?: string;
  idToken?: string; // Expect idToken in request body
  // Add other fields you expect from the client after Web3Auth login
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequestBody = await request.json();

    // Basic validation: Check if at least email is provided
    if (!body.email) {
      return NextResponse.json({ message: 'Email is required for session creation' }, { status: 400 });
    }

    // --- Prisma Upsert Logic ---
    let user; // Define user variable outside try block
    try {
      // Upsert user. Default role is handled by Prisma schema.
      user = await prisma.user.upsert({
        where: { email: body.email },
        update: {
          // Update fields if user exists (Login)
          firstname: body.name, // Map Web3Auth name to firstname
          idToken: body.idToken, // Update idToken
          // Role is not updated here, it's set on creation
        },
        create: {
          // Create fields if user doesn't exist (Signup)
          email: body.email,
          firstname: body.name, // Map Web3Auth name to firstname
          idToken: body.idToken, // Set idToken
          // 'role' field will use the default 'PATIENT' from the schema
        },
        // Select the role field to include it in the returned user object
        select: {
          id: true,
          email: true,
          firstname: true,
          idToken: true,
          role: true, // Select the role field
        }
      });
      console.log('User upserted (created/updated) in DB:', user.email, 'with role:', user.role, 'and id:', user.id);
    } catch (dbError) {
      console.error('Prisma upsert error:', dbError);
      // Decide how to handle DB errors - maybe still create session?
      // For now, let's return an error if DB operation fails.
      return NextResponse.json({ message: 'Database operation failed' }, { status: 500 });
    }
    // --- End Prisma Upsert Logic ---


    // --- Session Creation Logic ---
    const cookieStore = await cookies(); // Get the cookie store
    // Using type assertion (as any) to bypass TS error with cookies()
    const session = await getIronSession<SessionData>(cookieStore as any, sessionOptions);

    // Set session data based on the upserted user data
    session.isLoggedIn = true;
    session.email = user.email; // Use email from DB user
    session.name = user.firstname; // Use name from DB user (firstname)
    session.profileImage = body.profileImage; // Use profileImage from body (not in User model)
    session.idToken = user.idToken; // Use idToken from DB user
    session.role = user.role; // Store role in session
    session.userId = user.id; // Store user ID in session
    // Set other relevant fields if needed

    // Save the session to set the cookie
    await session.save();

    console.log('Session created for:', body.email);

    // Return the session data (optional, but can be useful for the client)
    return NextResponse.json(session);

  } catch (error) {
    console.error('Login API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Session creation failed: ${errorMessage}` }, { status: 500 });
  }
}
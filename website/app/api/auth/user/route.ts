// app/api/auth/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';

// Default session data when user is not logged in
const defaultSession: SessionData = {
  isLoggedIn: false,
};

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies(); // Get the cookie store
    // Using type assertion (as any) and passing the resolved store
    const session = await getIronSession<SessionData>(cookieStore as any, sessionOptions);

    // If session doesn't exist or isLoggedIn is false, return default
    if (!session || !session.isLoggedIn) {
      return NextResponse.json(defaultSession);
    }

    // Return the actual session data
    return NextResponse.json(session);

  } catch (error) {
    console.error('Get User Session API error:', error);
    // Return default session state in case of error during retrieval
    return NextResponse.json(defaultSession, { status: 500 });
  }
}
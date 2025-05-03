// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies(); // Get the cookie store
    // Using type assertion (as any) and passing the resolved store
    const session = await getIronSession<SessionData>(cookieStore as any, sessionOptions);

    // Destroy the session
    session.destroy();

    console.log('Session destroyed');

    // You might not need to return the empty session, just confirmation
    // return NextResponse.json({ isLoggedIn: false }); // Or just success
    return NextResponse.json({ message: 'Logout successful' });


  } catch (error) {
    console.error('Logout API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Logout failed: ${errorMessage}` }, { status: 500 });
  }
}
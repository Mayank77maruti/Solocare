// lib/session.ts
import type { SessionOptions } from 'iron-session'; // Corrected type import
import type { UserInfo } from '@web3auth/base'; // Assuming UserInfo might be stored
import { RoleName } from '@prisma/client'; // Import RoleName enum

// Define the shape of the data stored in the session
// Adjust this based on what you actually need from Web3Auth user info
export interface SessionData {
  isLoggedIn: boolean;
  email?: string | null; // Allow email to be null if your schema allows it, though it's @unique non-null
  name?: string | null; // Allow name to be null to match Prisma firstname
  profileImage?: string; // Keep as string | undefined as it's from Web3Auth body, not DB
  idToken?: string | null; // Allow idToken to be null to match Prisma
  role?: RoleName; // Add role field using the enum type
  // Add other relevant fields from UserInfo if needed
  // e.g., verifier, verifierId, typeOfLogin etc.
  userId?: string; // Add userId field
}

export const sessionOptions: SessionOptions = { // Corrected type usage
  cookieName: 'solocare_session', // Choose a unique name for your session cookie
  password: process.env.SESSION_PASSWORD as string, // Get password from environment variable
  cookieOptions: {
    // secure: true should be used in production (HTTPS)
    // NODE_ENV is typically 'production' on deployed environments
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, // Prevent client-side JS access to the cookie
    sameSite: 'lax', // Recommended for most cases
    maxAge: 60 * 60 * 24 * 7 // Example: 7 days validity
    // path: '/', // Default is '/'
  },
};

// This is where we specify the typings of req.session.*
// Extend the IronSessionData interface with our SessionData shape
declare module 'iron-session' {
  interface IronSessionData extends SessionData {}
}
/**
 * ==============================================================================
 * API ROUTE: NextAuth Handler (src/app/api/auth/[...nextauth]/route.ts)
 * PURPOSE: Handles authentication endpoints (sign in, sign out, session token).
 * ==============================================================================
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

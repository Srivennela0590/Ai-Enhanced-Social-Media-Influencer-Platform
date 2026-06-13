// ============================================================
// Authentication Middleware
// ============================================================
// In a production Next.js 15 environment, this would be
// implemented as Next.js middleware in middleware.ts at the
// root of the project.
//
// For the SPA, route protection is handled by the
// ProtectedRoute component.
// ============================================================

import { verifyToken, getCurrentUser } from '@/services/auth';
import type { UserRole, JWTPayload, SafeUser } from '@/types';

/**
 * Middleware: Verify JWT token from request
 * Production: Extracts token from Authorization header or cookie
 */
export function authenticateToken(token: string | null): JWTPayload | null {
  if (!token) return null;
  
  // Remove "Bearer " prefix if present
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
  return verifyToken(cleanToken);
}

/**
 * Middleware: Role-based access control
 * Checks if the authenticated user has the required role
 */
export function authorizeRole(allowedRoles: UserRole[]): (user: SafeUser | null) => boolean {
  return (user: SafeUser | null): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };
}

/**
 * Middleware: Resource ownership check
 * Ensures a user can only modify their own resources
 */
export function authorizeOwner(resourceUserId: string): boolean {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  return currentUser.id === resourceUserId;
}

/**
 * Middleware chain for protected API routes
 * Usage: withAuth(handler, ['brand'])
 */
export function withAuth(
  handler: (user: SafeUser) => void,
  requiredRoles?: UserRole[]
): void {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }

  handler(user);
}

/**
 * Rate limiting configuration
 * Production: Use redis-based rate limiting
 */
export const RATE_LIMITS = {
  auth: {
    login: { windowMs: 15 * 60 * 1000, max: 5 },
    register: { windowMs: 60 * 60 * 1000, max: 3 },
    passwordReset: { windowMs: 60 * 60 * 1000, max: 3 },
  },
  api: {
    general: { windowMs: 15 * 60 * 1000, max: 100 },
    search: { windowMs: 1 * 60 * 1000, max: 30 },
    aiMatch: { windowMs: 1 * 60 * 1000, max: 10 },
  },
} as const;

/**
 * Next.js 15 Middleware Configuration Reference
 * 
 * File: middleware.ts (project root)
 * 
 * ```typescript
 * import { NextResponse } from 'next/server';
 * import type { NextRequest } from 'next/server';
 * import { jwtVerify } from 'jose';
 * 
 * const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
 * 
 * const protectedPaths = ['/dashboard', '/campaigns', '/profile', '/api/'];
 * const authPaths = ['/login', '/register'];
 * const publicApiPaths = ['/api/auth/login', '/api/auth/register'];
 * 
 * export async function middleware(request: NextRequest) {
 *   const { pathname } = request.nextUrl;
 *   const token = request.cookies.get('auth-token')?.value;
 * 
 *   // Skip public paths
 *   if (publicApiPaths.some(p => pathname.startsWith(p))) {
 *     return NextResponse.next();
 *   }
 * 
 *   // Protected routes
 *   if (protectedPaths.some(p => pathname.startsWith(p))) {
 *     if (!token) {
 *       if (pathname.startsWith('/api/')) {
 *         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *       }
 *       return NextResponse.redirect(new URL('/login', request.url));
 *     }
 * 
 *     try {
 *       const { payload } = await jwtVerify(token, JWT_SECRET);
 *       const response = NextResponse.next();
 *       response.headers.set('x-user-id', payload.sub as string);
 *       response.headers.set('x-user-role', payload.role as string);
 *       return response;
 *     } catch {
 *       return NextResponse.redirect(new URL('/login', request.url));
 *     }
 *   }
 * 
 *   // Redirect authenticated users away from auth pages
 *   if (authPaths.includes(pathname) && token) {
 *     try {
 *       await jwtVerify(token, JWT_SECRET);
 *       return NextResponse.redirect(new URL('/dashboard', request.url));
 *     } catch {
 *       // Invalid token, allow access to auth pages
 *     }
 *   }
 * 
 *   return NextResponse.next();
 * }
 * 
 * export const config = {
 *   matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
 * };
 * ```
 */

export default { authenticateToken, authorizeRole, authorizeOwner, withAuth, RATE_LIMITS };

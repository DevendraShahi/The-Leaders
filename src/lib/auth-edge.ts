/**
 * Edge-compatible JWT utilities using jose library
 * This file can be imported in Edge Runtime (middleware)
 */

import { jwtVerify, SignJWT } from 'jose';
import type { JWTPayload } from './auth';
import { getJwtSecret } from './auth-config';

const encodedSecret = () => new TextEncoder().encode(getJwtSecret());

/**
 * Verify JWT token (Edge-compatible)
 */
export async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, encodedSecret());

        return {
            userId: payload.userId as string,
            email: payload.email as string,
            role: payload.role as 'superadmin' | 'cto' | 'editorial' | 'cmo',
            permissions: payload.permissions,
        };
    } catch (error) {
        console.error('Edge token verification failed:', error);
        return null;
    }
}

/**
 * Generate JWT token (Edge-compatible)
 */
export async function generateTokenEdge(payload: JWTPayload): Promise<string> {
    try {
        const token = await new SignJWT({
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            permissions: payload.permissions,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(encodedSecret());

        return token;
    } catch (error) {
        console.error('Edge token generation failed:', error);
        throw error;
    }
}

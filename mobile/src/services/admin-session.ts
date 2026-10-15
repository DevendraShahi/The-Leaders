import { z } from 'zod';
import { accountApiBase } from './admin-account';

const sessionSchema = z.object({ token: z.string().min(1), sessionId: z.string().uuid(), expiresAt: z.number() });
export type AdminSession = z.infer<typeof sessionSchema>;
export function parseAdminSession(value: unknown): AdminSession | null {
    const result = sessionSchema.safeParse(value);
    return result.success && result.data.expiresAt > Date.now() ? result.data : null;
}
export async function signInAdmin(email: string, password: string): Promise<AdminSession> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(`${accountApiBase()}/api/v1/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password }),
            cache: 'no-store', signal: controller.signal,
        });
        const body = await response.json();
        if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'Unable to sign in. Please try again.');
        const session = parseAdminSession(body);
        if (!session) throw new Error('The server returned an invalid session. Please try again.');
        return session;
    } catch (error) {
        if (error instanceof TypeError || (error instanceof Error && error.name === 'AbortError')) throw new Error('Could not reach The Leaders login server. Check your connection and try again.');
        throw error;
    } finally { clearTimeout(timeout); }
}

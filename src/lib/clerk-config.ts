/** Clerk is optional; database sessions must work without a configured Clerk app. */
export function isClerkConfigured(): boolean {
    const publishable = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const secret = process.env.CLERK_SECRET_KEY;
    const publicParts = publishable?.match(/^pk_(test|live)_([A-Za-z0-9+/_=-]+)$/);
    const secretParts = secret?.match(/^sk_(test|live)_[A-Za-z0-9_-]+$/);
    if (!publicParts || !secretParts || publicParts[1] !== secretParts[1]) return false;
    try {
        const encoded = publicParts[2].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(encoded);
        if (!decoded.endsWith('$')) return false;
        const host = decoded.slice(0, -1);
        const url = new URL(`https://${host}`);
        return url.hostname === host && host.includes('.') && !url.port && !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash;
    } catch { return false; }
}

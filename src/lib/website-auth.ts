import { getMobileAdmin } from './mobile-auth';
export const websiteSessionCookie = 'leaders_admin_session';
/** Cookies are accepted only for same-origin writes. Native clients use bearer sessions. */
export async function getWebsiteAdmin(request: Request) {
    if (request.headers.has('authorization')) return getMobileAdmin(request);
    const token = request.headers.get('cookie')?.split(';').map(value => value.trim()).find(value => value.startsWith(`${websiteSessionCookie}=`))?.slice(websiteSessionCookie.length + 1);
    if (!token) return null;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && request.headers.get('origin') !== new URL(request.url).origin) return null;
    const headers = new Headers(request.headers);
    headers.set('authorization', `Bearer ${token}`);
    return getMobileAdmin(new Request(request, { headers }));
}

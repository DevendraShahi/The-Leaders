import { auth, currentUser } from '@clerk/nextjs/server';
import dbConnect from './db';
import Admin from '@/models/Admin';
import { getMobileAdmin } from './mobile-auth';

export const websiteSessionCookie = 'leaders_admin_session';

/** Both browser sign-in methods authorize against the current admin record. */
export async function getWebsiteAdmin(request: Request) {
    // Native clients retain their scoped bearer sessions.
    if (request.headers.has('authorization')) return getMobileAdmin(request);
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)
        && request.headers.get('origin') !== new URL(request.url).origin) return null;

    const token = request.headers.get('cookie')?.split(';').map(value => value.trim())
        .find(value => value.startsWith(`${websiteSessionCookie}=`))?.slice(websiteSessionCookie.length + 1);
    if (token) {
        const headers = new Headers(request.headers);
        headers.set('authorization', `Bearer ${token}`);
        const legacyAdmin = await getMobileAdmin(new Request(request, { headers }));
        if (legacyAdmin) return legacyAdmin;
        // An expired password cookie must not prevent a fresh Clerk sign-in.
    }

    const { userId } = await auth();
    if (!userId) return null;

    await dbConnect();
    const linked = await Admin.findOne({ clerkId: userId });
    if (linked) return linked.isActive ? linked : null;

    // Link only existing active accounts with a verified primary email.
    // Never relink another Clerk identity or grant access to a new signup.
    const identity = await currentUser();
    if (identity?.id !== userId) return null;
    const primaryEmail = identity.emailAddresses.find(email => email.id === identity.primaryEmailAddressId);
    if (primaryEmail?.verification?.status !== 'verified') return null;
    return Admin.findOneAndUpdate({
        email: primaryEmail.emailAddress.trim().toLowerCase(),
        isActive: true,
        $or: [{ clerkId: { $exists: false } }, { clerkId: null }, { clerkId: userId }],
    }, { $set: { clerkId: userId } }, { new: true });
}

import AuthProvider from '@/components/admin/AuthProvider';
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { isClerkConfigured } from '@/lib/clerk-config';

// Read optional server auth configuration per request, not from a prerendered shell.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
        },
    },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    if (!isClerkConfigured()) {
        return <AuthProvider clerkEnabled={false}>{children}</AuthProvider>;
    }
    return (
        <ClerkProvider signInUrl="/admin/login" signUpUrl="/admin/signup" signInFallbackRedirectUrl="/admin" signUpFallbackRedirectUrl="/admin/unauthorized">
            <AuthProvider>{children}</AuthProvider>
        </ClerkProvider>
    );
}

import AuthProvider from '@/components/admin/AuthProvider';
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';

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
    return (
        <ClerkProvider signInUrl="/admin/login" signUpUrl="/admin/signup" signInFallbackRedirectUrl="/admin" signUpFallbackRedirectUrl="/admin/unauthorized">
            <AuthProvider>{children}</AuthProvider>
        </ClerkProvider>
    );
}

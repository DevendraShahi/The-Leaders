'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";

export default function LayoutStructureWrapper({
    children,
    socialLinks = []
}: {
    children: React.ReactNode;
    socialLinks?: any[];
}) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith("/admin") || pathname?.startsWith("/api/admin") || pathname?.startsWith("/api/auth");

    if (isAdminRoute) {
        return (
            <div className="min-h-screen bg-background">
                {children}
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen py-[2.5rem] md:py-18">
                {children}
            </main>
            <Footer socialLinks={socialLinks} />
        </>
    );
}

"use client";

import { ElectionNavbar } from "@/components/election/ElectionNavbar";
import { ElectionProviders } from "@/components/election/ElectionProviders";

export function ElectionLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ElectionProviders>
            <div className="election-typography flex min-h-screen flex-col bg-background">
                <ElectionNavbar />
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </ElectionProviders>
    );
}

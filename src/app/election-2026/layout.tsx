import { ElectionLayoutClient } from "@/components/election/ElectionLayoutClient";

export default function ElectionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Maintenance is now handled globally in RootLayout via MaintenanceGuard

    return (
        <ElectionLayoutClient>
            {children}
        </ElectionLayoutClient>
    );
}

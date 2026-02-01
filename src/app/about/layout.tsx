
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About",
    description: "Learn about our mission to archive and share Nepal's political history.",
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

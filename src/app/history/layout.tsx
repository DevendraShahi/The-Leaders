
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "History",
    description: "Timeline of Nepal's political history, from the Kot Massacre to the Federal Democratic Republic.",
};

export default function HistoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

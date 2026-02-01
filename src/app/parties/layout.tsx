
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Parties",
    description: "Overview of the major political parties shaping Nepal's democracy.",
};

export default function PartiesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

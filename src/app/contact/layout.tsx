
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact",
    description: "Get in touch with The Leaders team.",
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

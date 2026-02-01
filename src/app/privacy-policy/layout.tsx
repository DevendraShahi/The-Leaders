
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Our commitment to protecting your privacy and personal data.",
};

export default function PrivacyPolicyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

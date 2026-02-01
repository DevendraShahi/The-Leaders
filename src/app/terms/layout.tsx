
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Terms and conditions for using The Leaders platform.",
};

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

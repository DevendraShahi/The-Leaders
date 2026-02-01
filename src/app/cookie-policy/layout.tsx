
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cookie Policy",
    description: "Information about how we use cookies on The Leaders platform.",
};

export default function CookiePolicyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

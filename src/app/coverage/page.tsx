import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Page Not Found | The Leaders",
    robots: { index: false, follow: false },
};

export default function Coverage() {
    notFound();
}

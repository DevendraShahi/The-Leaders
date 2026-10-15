"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
export default function LayoutStructureWrapper({children, socialLinks = []}: {children: React.ReactNode; socialLinks?: any[]}) {
    const path = usePathname();
    if (path?.startsWith("/admin") || path?.startsWith("/sign-")) return <main>{children}</main>;
    return <><Navbar /><main className="min-h-screen pt-[64px] md:pt-[72px]">{children}</main><Footer socialLinks={socialLinks} /></>;
}

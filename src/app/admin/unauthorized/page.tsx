"use client";
import Link from 'next/link';
import { useAuth } from '@/components/admin/AuthProvider';
export default function Unauthorized() { const { logout } = useAuth(); return <main className="grid min-h-screen place-items-center p-6"><section className="max-w-md space-y-5"><h1 className="text-3xl font-semibold">Admin access required</h1><p>Contact your newsroom administrator to check your account permissions.</p><button onClick={logout} className="rounded bg-primary p-3 text-primary-foreground">Sign out</button> <Link href="/">Return home</Link></section></main>; }

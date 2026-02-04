import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 text-center">
            <h1 className="font-bebas text-9xl font-bold text-primary">404</h1>
            <h2 className="font-bebas text-4xl text-foreground">Page Not Found</h2>
            <p className="max-w-[500px] text-muted-foreground">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <div className="mt-8">
                <Button asChild size="lg">
                    <Link href="/">Return Home</Link>
                </Button>
            </div>
        </div>
    );
}

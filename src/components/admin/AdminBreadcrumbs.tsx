"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

export default function AdminBreadcrumbs() {
    const pathname = usePathname();

    // Split path and remove empty strings
    const paths = pathname?.split('/').filter(Boolean) || [];

    // Ignore 'admin' as root since we show Home icon
    const breadcrumbs = paths.filter(path => path !== 'admin');

    return (
        <nav className="flex items-center text-sm text-muted-foreground mb-4 sm:mb-0">
            <Link
                href="/admin"
                className="flex items-center hover:text-foreground transition-colors"
                title="Dashboard"
            >
                <Home className="h-4 w-4" />
            </Link>

            {breadcrumbs.map((path, index) => {
                // Construct href for this segment
                // We need to re-add 'admin' prefix and all segments up to this one
                const href = `/admin/${breadcrumbs.slice(0, index + 1).join('/')}`;

                // Format label: remove hyphens, capitalize
                const label = path === '(protected)' ? '' : path.replace(/-/g, ' ');

                if (!label) return null;

                const isLast = index === breadcrumbs.length - 1;

                return (
                    <Fragment key={path}>
                        <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
                        {isLast ? (
                            <span className="font-medium text-foreground capitalize">
                                {label}
                            </span>
                        ) : (
                            <Link
                                href={href}
                                className="hover:text-foreground transition-colors capitalize"
                            >
                                {label}
                            </Link>
                        )}
                    </Fragment>
                );
            })}
        </nav>
    );
}

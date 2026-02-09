import { IAdmin, IPermissions } from "@/models/Admin";

/**
 * Default permissions for each role
 */
export function getDefaultPermissions(role: IAdmin['role']): IPermissions {
    switch (role) {
        case 'superadmin':
            return {
                pageAccess: { dashboard: true, content: true, media: true, messages: true, settings: true, users: true },
                articles: { create: true, edit: true, delete: true, publish: true },
                settings: { view: true, modify: true },
                users: { view: true, manage: true },
                analytics: { view: true, viewAll: true },
            };

        case 'cto':
            return {
                pageAccess: { dashboard: true, content: false, media: true, messages: true, settings: true, users: false },
                articles: { create: false, edit: false, delete: false, publish: false },
                settings: { view: true, modify: true },
                users: { view: false, manage: false },
                analytics: { view: true, viewAll: false },
            };

        case 'editorial':
            return {
                pageAccess: { dashboard: true, content: true, media: true, messages: true, settings: false, users: false },
                articles: { create: true, edit: true, delete: true, publish: true },
                settings: { view: false, modify: false },
                users: { view: false, manage: false },
                analytics: { view: true, viewAll: false },
            };

        case 'cmo':
            return {
                pageAccess: { dashboard: true, content: false, media: true, messages: true, settings: false, users: false },
                articles: { create: false, edit: false, delete: false, publish: false },
                settings: { view: false, modify: false },
                users: { view: false, manage: false },
                analytics: { view: true, viewAll: true },
            };

        default:
            // Fallback - no permissions
            return {
                pageAccess: { dashboard: false, content: false, media: false, messages: false, settings: false, users: false },
                articles: { create: false, edit: false, delete: false, publish: false },
                settings: { view: false, modify: false },
                users: { view: false, manage: false },
                analytics: { view: false, viewAll: false },
            };
    }
}

export function ensurePermissionShape(
    role: IAdmin['role'],
    permissions?: Partial<IPermissions> | null
): IPermissions {
    const defaults = getDefaultPermissions(role);
    return {
        ...defaults,
        ...permissions,
        pageAccess: {
            ...defaults.pageAccess,
            ...(permissions?.pageAccess || {}),
        },
        articles: {
            ...defaults.articles,
            ...(permissions?.articles || {}),
        },
        settings: {
            ...defaults.settings,
            ...(permissions?.settings || {}),
        },
        users: {
            ...defaults.users,
            ...(permissions?.users || {}),
        },
        analytics: {
            ...defaults.analytics,
            ...(permissions?.analytics || {}),
        },
    };
}

/**
 * Check if an admin has a specific permission
 */
export function hasPermission(
    admin: IAdmin,
    resource: keyof IPermissions,
    action: string
): boolean {
    if (admin.role === 'superadmin') {
        return true; // Superadmin has all permissions
    }

    const resourcePermissions = admin.permissions[resource];
    if (!resourcePermissions) {
        return false;
    }

    return (resourcePermissions as any)[action] === true;
}

/**
 * Enforce isolation - filter queries to prevent non-superadmin from seeing other admins
 */
export function enforceIsolation(admin: IAdmin, query: any = {}): any {
    if (admin.role === 'superadmin') {
        return query; // Superadmin sees everything
    }

    // Non-superadmin can only query their own data
    return {
        ...query,
        _id: admin._id,
    };
}

/**
 * Filter admin list query - superadmin sees all, others see only themselves
 */
export function filterAdminListQuery(admin: IAdmin): any {
    if (admin.role === 'superadmin') {
        // Superadmin sees all non-superadmin accounts
        return { role: { $ne: 'superadmin' } };
    }

    // Non-superadmin cannot query admin list at all
    return { _id: 'ISOLATION_BLOCK' }; // This will return empty results
}

/**
 * Check if admin can access a specific route/resource
 */
export function canAccessRoute(admin: IAdmin, route: string): boolean {
    if (admin.role === 'superadmin') {
        return true;
    }

    const routePermissions: Record<string, IAdmin['role'][]> = {
        '/admin/settings': ['cto'],
        '/admin/articles': ['editorial'],
        '/admin/analytics': ['cmo', 'editorial'],
        '/admin/users': [], // Only superadmin
    };

    const allowedRoles = routePermissions[route];
    if (!allowedRoles) {
        return false;
    }

    return allowedRoles.includes(admin.role);
}

/**
 * Sanitize admin object for API response - remove sensitive fields
 */
export function sanitizeAdminForResponse(admin: IAdmin): Partial<IAdmin> {
    const { passwordHash, ...rest } = admin;
    void passwordHash;
    const safeAdmin = rest;
    return safeAdmin;
}

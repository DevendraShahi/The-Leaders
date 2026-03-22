import { describe, it, expect } from 'vitest'
import { getDefaultPermissions, ensurePermissionShape, hasPermission, enforceIsolation, filterAdminListQuery, canAccessRoute, sanitizeAdminForResponse } from '@/lib/rbac'

describe('RBAC utilities', () => {
    describe('getDefaultPermissions', () => {
        it('should return full permissions for superadmin', () => {
            const perms = getDefaultPermissions('superadmin')
            
            expect(perms.pageAccess.dashboard).toBe(true)
            expect(perms.pageAccess.content).toBe(true)
            expect(perms.pageAccess.media).toBe(true)
            expect(perms.pageAccess.messages).toBe(true)
            expect(perms.pageAccess.settings).toBe(true)
            expect(perms.pageAccess.users).toBe(true)
            expect(perms.articles.create).toBe(true)
            expect(perms.articles.edit).toBe(true)
            expect(perms.articles.delete).toBe(true)
            expect(perms.articles.publish).toBe(true)
        })

        it('should return limited permissions for cto', () => {
            const perms = getDefaultPermissions('cto')
            
            expect(perms.pageAccess.dashboard).toBe(true)
            expect(perms.pageAccess.content).toBe(false)
            expect(perms.pageAccess.media).toBe(true)
            expect(perms.pageAccess.users).toBe(false)
            expect(perms.articles.create).toBe(false)
            expect(perms.analytics.view).toBe(true)
            expect(perms.analytics.viewAll).toBe(false)
        })

        it('should return editorial permissions', () => {
            const perms = getDefaultPermissions('editorial')
            
            expect(perms.pageAccess.content).toBe(true)
            expect(perms.pageAccess.settings).toBe(false)
            expect(perms.articles.create).toBe(true)
            expect(perms.articles.edit).toBe(true)
            expect(perms.articles.delete).toBe(true)
        })

        it('should return cmo permissions', () => {
            const perms = getDefaultPermissions('cmo')
            
            expect(perms.pageAccess.content).toBe(false)
            expect(perms.pageAccess.messages).toBe(true)
            expect(perms.analytics.viewAll).toBe(true)
            expect(perms.articles.create).toBe(false)
        })

        it('should return empty permissions for unknown role', () => {
            const perms = getDefaultPermissions('unknown' as any)
            
            expect(perms.pageAccess.dashboard).toBe(false)
            expect(perms.articles.create).toBe(false)
            expect(perms.settings.modify).toBe(false)
        })
    })

    describe('ensurePermissionShape', () => {
        it('should return default permissions when no overrides provided', () => {
            const perms = ensurePermissionShape('editorial')
            expect(perms.articles.create).toBe(true)
        })

        it('should override specific permissions', () => {
            const perms = ensurePermissionShape('editorial', {
                articles: { create: false, edit: true, delete: true, publish: true }
            } as any)
            
            expect(perms.articles.create).toBe(false)
            expect(perms.articles.edit).toBe(true)
        })

        it('should handle null permissions', () => {
            const perms = ensurePermissionShape('superadmin', null)
            expect(perms.articles.create).toBe(true)
        })
    })

    describe('hasPermission', () => {
        const superadmin = { role: 'superadmin' } as any
        const editorial = { 
            role: 'editorial',
            permissions: getDefaultPermissions('editorial')
        } as any

        it('should always return true for superadmin', () => {
            expect(hasPermission(superadmin, 'articles', 'create')).toBe(true)
            expect(hasPermission(superadmin, 'users', 'manage')).toBe(true)
            expect(hasPermission(superadmin, 'settings', 'modify')).toBe(true)
        })

        it('should check article permissions for editorial', () => {
            expect(hasPermission(editorial, 'articles', 'create')).toBe(true)
            expect(hasPermission(editorial, 'articles', 'delete')).toBe(true)
        })

        it('should return false for unauthorized access', () => {
            expect(hasPermission(editorial, 'settings', 'modify')).toBe(false)
            expect(hasPermission(editorial, 'users', 'manage')).toBe(false)
        })

        it('should return false for non-existent resource', () => {
            expect(hasPermission(editorial, 'unknown' as any, 'action')).toBe(false)
        })
    })

    describe('enforceIsolation', () => {
        const superadmin = { _id: 'super123', role: 'superadmin' } as any
        const regularAdmin = { _id: 'admin456', role: 'editorial' } as any

        it('should return original query for superadmin', () => {
            const query = { status: 'active' }
            const result = enforceIsolation(superadmin, query)
            expect(result).toEqual({ status: 'active' })
        })

        it('should filter query for non-superadmin', () => {
            const query = { status: 'active' }
            const result = enforceIsolation(regularAdmin, query)
            expect(result).toEqual({ _id: regularAdmin._id, status: 'active' })
        })
    })

    describe('filterAdminListQuery', () => {
        const superadmin = { role: 'superadmin' } as any
        const regularAdmin = { role: 'editorial' } as any

        it('should allow all non-superadmin for superadmin', () => {
            const result = filterAdminListQuery(superadmin)
            expect(result).toEqual({ role: { $ne: 'superadmin' } })
        })

        it('should block all queries for non-superadmin', () => {
            const result = filterAdminListQuery(regularAdmin)
            expect(result).toEqual({ _id: 'ISOLATION_BLOCK' })
        })
    })

    describe('canAccessRoute', () => {
        const superadmin = { role: 'superadmin' } as any
        const cto = { role: 'cto' } as any
        const editorial = { role: 'editorial' } as any
        const cmo = { role: 'cmo' } as any

        it('should allow superadmin access to all routes', () => {
            expect(canAccessRoute(superadmin, '/admin/settings')).toBe(true)
            expect(canAccessRoute(superadmin, '/admin/articles')).toBe(true)
            expect(canAccessRoute(superadmin, '/admin/users')).toBe(true)
        })

        it('should allow cto access to settings', () => {
            expect(canAccessRoute(cto, '/admin/settings')).toBe(true)
        })

        it('should not allow cto access to articles', () => {
            expect(canAccessRoute(cto, '/admin/articles')).toBe(false)
        })

        it('should allow editorial access to articles', () => {
            expect(canAccessRoute(editorial, '/admin/articles')).toBe(true)
            expect(canAccessRoute(editorial, '/admin/analytics')).toBe(true)
        })

        it('should allow cmo access to analytics', () => {
            expect(canAccessRoute(cmo, '/admin/analytics')).toBe(true)
        })

        it('should deny access to non-existent routes for non-superadmin', () => {
            expect(canAccessRoute(editorial, '/admin/nonexistent')).toBe(false)
        })
    })

    describe('sanitizeAdminForResponse', () => {
        it('should remove passwordHash from admin object', () => {
            const admin = {
                _id: '123',
                email: 'test@example.com',
                passwordHash: 'secret-hash',
                role: 'editorial'
            } as any
            
            const result = sanitizeAdminForResponse(admin)
            
            expect(result.passwordHash).toBeUndefined()
            expect(result._id).toBe('123')
            expect(result.email).toBe('test@example.com')
        })
    })
})

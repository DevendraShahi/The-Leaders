import { describe, expect, it } from 'vitest';
import {
    canCreateArticle,
    canUpdateArticle,
    hasArticlePermission,
    isArticleStatus,
    type ArticleActor,
} from '@/lib/article-permissions';
import { getDefaultPermissions } from '@/lib/rbac';

function actor(overrides: Partial<ArticleActor['permissions']> = {}): ArticleActor {
    const permissions = getDefaultPermissions('editorial');
    return {
        role: 'editorial',
        permissions: {
            ...permissions,
            ...overrides,
            articles: {
                ...permissions.articles,
                ...(overrides.articles || {}),
            },
        },
    };
}

describe('article permissions', () => {
    it('recognizes only persisted article statuses', () => {
        expect(isArticleStatus('draft')).toBe(true);
        expect(isArticleStatus('published')).toBe(true);
        expect(isArticleStatus('archived')).toBe(true);
        expect(isArticleStatus('scheduled')).toBe(false);
        expect(isArticleStatus(undefined)).toBe(false);
    });

    it('allows superadmins to perform every article action', () => {
        const superadmin = { role: 'superadmin', permissions: {} } as ArticleActor;

        expect(hasArticlePermission(superadmin, 'create')).toBe(true);
        expect(hasArticlePermission(superadmin, 'edit')).toBe(true);
        expect(hasArticlePermission(superadmin, 'delete')).toBe(true);
        expect(hasArticlePermission(superadmin, 'publish')).toBe(true);
    });

    it('does not allow creation when create permission is absent', () => {
        const withoutCreate = actor({
            articles: { create: false, edit: true, delete: true, publish: true },
        });

        expect(canCreateArticle(withoutCreate, 'draft')).toBe(false);
        expect(canCreateArticle(withoutCreate, 'published')).toBe(false);
    });

    it('requires publish permission to create a published article', () => {
        const withoutPublish = actor({
            articles: { create: true, edit: true, delete: true, publish: false },
        });

        expect(canCreateArticle(withoutPublish, 'draft')).toBe(true);
        expect(canCreateArticle(withoutPublish, 'published')).toBe(false);
    });

    it('requires edit permission for every update', () => {
        const withoutEdit = actor({
            articles: { create: true, edit: false, delete: true, publish: true },
        });

        expect(canUpdateArticle(withoutEdit, 'draft', 'draft')).toBe(false);
    });

    it('requires publish permission to publish or modify a published article', () => {
        const withoutPublish = actor({
            articles: { create: true, edit: true, delete: true, publish: false },
        });

        expect(canUpdateArticle(withoutPublish, 'draft', 'draft')).toBe(true);
        expect(canUpdateArticle(withoutPublish, 'draft', 'published')).toBe(false);
        expect(canUpdateArticle(withoutPublish, 'published', 'published')).toBe(false);
        expect(canUpdateArticle(withoutPublish, 'published', 'draft')).toBe(false);
    });
});

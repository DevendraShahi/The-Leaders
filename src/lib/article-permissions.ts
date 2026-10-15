import type { JWTPayload } from '@/lib/auth';
import type { IPermissions } from '@/models/Admin';

export const ARTICLE_STATUSES = ['draft', 'published', 'archived'] as const;

export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];
export type ArticlePermission = keyof IPermissions['articles'];
export type ArticleActor = Pick<JWTPayload, 'role' | 'permissions'>;

export function isArticleStatus(value: unknown): value is ArticleStatus {
    return typeof value === 'string' && ARTICLE_STATUSES.includes(value as ArticleStatus);
}

export function hasArticlePermission(actor: ArticleActor, permission: ArticlePermission): boolean {
    if (actor.role === 'superadmin') return true;

    const permissions = actor.permissions as Partial<IPermissions> | undefined;
    return permissions?.articles?.[permission] === true;
}

export function canCreateArticle(actor: ArticleActor, status: ArticleStatus): boolean {
    return hasArticlePermission(actor, 'create') &&
        (status !== 'published' || hasArticlePermission(actor, 'publish'));
}

export function canUpdateArticle(
    actor: ArticleActor,
    currentStatus: ArticleStatus,
    requestedStatus: ArticleStatus,
): boolean {
    if (!hasArticlePermission(actor, 'edit')) return false;

    // A published article is public immediately. Changing its content, taking it
    // down, or publishing a draft therefore all require publish permission.
    return currentStatus !== 'published' && requestedStatus !== 'published' ||
        hasArticlePermission(actor, 'publish');
}

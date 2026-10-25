/** Safe categories for the UI; underlying failures stay in server logs. */
export class AdminSessionError extends Error {
    constructor(public readonly code: 'AUTH_DATABASE_CONNECTION' | 'AUTH_ACCOUNT_LOOKUP', cause: unknown) {
        super(code === 'AUTH_DATABASE_CONNECTION' ? 'Account database connection unavailable. Please retry.' : 'Could not load your admin account. Please retry.', { cause });
        this.name = 'AdminSessionError';
    }
}

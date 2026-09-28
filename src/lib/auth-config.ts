const TEST_JWT_SECRET = "test-only-jwt-secret-that-is-never-used-in-production";

export function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET?.trim();

    if (secret) {
        if (process.env.NODE_ENV === "production" && secret.length < 32) {
            throw new Error("JWT_SECRET must be at least 32 characters in production");
        }
        return secret;
    }

    if (process.env.NODE_ENV === "test") {
        return TEST_JWT_SECRET;
    }

    throw new Error("JWT_SECRET is required");
}

export function getAdminSetupToken(): string | null {
    const token = process.env.ADMIN_SETUP_TOKEN?.trim();
    return token && token.length >= 24 ? token : null;
}

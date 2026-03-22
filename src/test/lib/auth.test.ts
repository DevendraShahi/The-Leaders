import { describe, it, expect, beforeEach, vi } from 'vitest'
import { hashPassword, verifyPassword, generateToken, verifyToken, extractTokenFromHeader, generateSecureToken } from '@/lib/auth'

describe('auth utilities', () => {
    describe('hashPassword', () => {
        it('should hash a password', async () => {
            const password = 'testPassword123'
            const hash = await hashPassword(password)
            
            expect(hash).toBeDefined()
            expect(hash).not.toBe(password)
            expect(hash.length).toBeGreaterThan(20)
        })

        it('should generate different hashes for same password', async () => {
            const password = 'testPassword123'
            const hash1 = await hashPassword(password)
            const hash2 = await hashPassword(password)
            
            expect(hash1).not.toBe(hash2)
        })
    })

    describe('verifyPassword', () => {
        it('should return true for correct password', async () => {
            const password = 'testPassword123'
            const hash = await hashPassword(password)
            
            const result = await verifyPassword(password, hash)
            expect(result).toBe(true)
        })

        it('should return false for incorrect password', async () => {
            const password = 'testPassword123'
            const hash = await hashPassword(password)
            
            const result = await verifyPassword('wrongPassword', hash)
            expect(result).toBe(false)
        })

        it('should return false for empty password', async () => {
            const hash = await hashPassword('testPassword123')
            
            const result = await verifyPassword('', hash)
            expect(result).toBe(false)
        })
    })

    describe('generateToken', () => {
        it('should generate a valid JWT token', () => {
            const payload = {
                userId: '123',
                email: 'test@example.com',
                role: 'editorial' as const
            }
            
            const token = generateToken(payload)
            
            expect(token).toBeDefined()
            expect(typeof token).toBe('string')
            expect(token.split('.')).toHaveLength(3)
        })

        it('should include payload in token', () => {
            const payload = {
                userId: 'user123',
                email: 'admin@test.com',
                role: 'superadmin' as const
            }
            
            const token = generateToken(payload)
            const decoded = verifyToken(token)
            
            expect(decoded?.userId).toBe(payload.userId)
            expect(decoded?.email).toBe(payload.email)
            expect(decoded?.role).toBe(payload.role)
        })
    })

    describe('verifyToken', () => {
        it('should verify and decode a valid token', () => {
            const payload = {
                userId: '123',
                email: 'test@example.com',
                role: 'cto' as const
            }
            
            const token = generateToken(payload)
            const decoded = verifyToken(token)
            
            expect(decoded).not.toBeNull()
            expect(decoded?.userId).toBe('123')
            expect(decoded?.email).toBe('test@example.com')
        })

        it('should return null for invalid token', () => {
            const result = verifyToken('invalid.token.here')
            expect(result).toBeNull()
        })

        it('should return null for malformed token', () => {
            const result = verifyToken('not-a-jwt')
            expect(result).toBeNull()
        })

        it('should return null for empty token', () => {
            const result = verifyToken('')
            expect(result).toBeNull()
        })

        it('should return null for token with wrong signature', () => {
            const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJpYXQiOjE1MTYyMzkwMjJ9.fake'
            const result = verifyToken(fakeToken)
            expect(result).toBeNull()
        })
    })

    describe('extractTokenFromHeader', () => {
        it('should extract token from valid Bearer header', () => {
            const result = extractTokenFromHeader('Bearer abc123token')
            expect(result).toBe('abc123token')
        })

        it('should return null for missing header', () => {
            const result = extractTokenFromHeader(null)
            expect(result).toBeNull()
        })

        it('should return null for non-Bearer header', () => {
            const result = extractTokenFromHeader('Basic abc123')
            expect(result).toBeNull()
        })

        it('should return null for empty string', () => {
            const result = extractTokenFromHeader('')
            expect(result).toBeNull()
        })

        it('should return null for Bearer without token', () => {
            const result = extractTokenFromHeader('Bearer ')
            expect(result).toBe('')
        })

        it('should handle token with spaces in Bearer scheme', () => {
            const result = extractTokenFromHeader('Bearer token-with-spaces')
            expect(result).toBe('token-with-spaces')
        })
    })

    describe('generateSecureToken', () => {
        it('should generate a token of expected length', () => {
            const token = generateSecureToken()
            expect(token.length).toBeGreaterThanOrEqual(20)
        })

        it('should generate unique tokens', () => {
            const token1 = generateSecureToken()
            const token2 = generateSecureToken()
            expect(token1).not.toBe(token2)
        })

        it('should only contain alphanumeric characters', () => {
            const token = generateSecureToken()
            expect(token).toMatch(/^[a-z0-9]+$/)
        })
    })
})

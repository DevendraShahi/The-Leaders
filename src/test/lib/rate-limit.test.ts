import { describe, it, expect, beforeEach } from 'vitest'
import { getClientIp, enforceRateLimit } from '@/lib/rate-limit'

describe('rate-limit utilities', () => {
    describe('getClientIp', () => {
        it('should extract IP from x-forwarded-for header', () => {
            const request = new Request('http://test.com') as any
            request.headers.get = (name: string) => {
                if (name === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1'
                return null
            }
            
            const ip = getClientIp(request)
            expect(ip).toBe('192.168.1.1')
        })

        it('should extract IP from x-real-ip header', () => {
            const request = new Request('http://test.com') as any
            request.headers.get = (name: string) => {
                if (name === 'x-real-ip') return '192.168.1.2'
                return null
            }
            
            const ip = getClientIp(request)
            expect(ip).toBe('192.168.1.2')
        })

        it('should extract IP from cf-connecting-ip header', () => {
            const request = new Request('http://test.com') as any
            request.headers.get = (name: string) => {
                if (name === 'cf-connecting-ip') return '192.168.1.3'
                return null
            }
            
            const ip = getClientIp(request)
            expect(ip).toBe('192.168.1.3')
        })

        it('should return unknown when no IP headers present', () => {
            const request = new Request('http://test.com') as any
            request.headers.get = () => null
            
            const ip = getClientIp(request)
            expect(ip).toBe('unknown')
        })

        it('should prioritize x-forwarded-for over others', () => {
            const request = new Request('http://test.com') as any
            request.headers.get = (name: string) => {
                if (name === 'x-forwarded-for') return '192.168.1.1'
                if (name === 'x-real-ip') return '192.168.1.2'
                return null
            }
            
            const ip = getClientIp(request)
            expect(ip).toBe('192.168.1.1')
        })

        it('should handle IP with spaces', () => {
            const request = new Request('http://test.com') as any
            request.headers.get = (name: string) => {
                if (name === 'x-forwarded-for') return '  192.168.1.1  '
                return null
            }
            
            const ip = getClientIp(request)
            expect(ip).toBe('192.168.1.1')
        })
    })

    describe('enforceRateLimit', () => {
        beforeEach(() => {
            globalThis.__rateLimitStore = undefined
        })

        it('should allow first request', () => {
            const result = enforceRateLimit('test-key', 5, 60000)
            expect(result.limited).toBe(false)
            expect(result.retryAfterSeconds).toBeUndefined()
        })

        it('should count requests correctly', () => {
            enforceRateLimit('test-key', 5, 60000)
            enforceRateLimit('test-key', 5, 60000)
            enforceRateLimit('test-key', 5, 60000)
            
            const result = enforceRateLimit('test-key', 5, 60000)
            expect(result.limited).toBe(false)
        })

        it('should block when limit exceeded', () => {
            for (let i = 0; i < 5; i++) {
                enforceRateLimit('test-key', 5, 60000)
            }
            
            const result = enforceRateLimit('test-key', 5, 60000)
            expect(result.limited).toBe(true)
            expect(result.retryAfterSeconds).toBeGreaterThan(0)
        })

        it('should track different keys independently', () => {
            enforceRateLimit('key-1', 2, 60000)
            enforceRateLimit('key-1', 2, 60000)
            
            const result1 = enforceRateLimit('key-1', 2, 60000)
            expect(result1.limited).toBe(true)
            
            const result2 = enforceRateLimit('key-2', 2, 60000)
            expect(result2.limited).toBe(false)
        })

        it('should reset after window expires', () => {
            const now = Date.now()
            
            globalThis.__rateLimitStore = new Map([[
                'test-key',
                { count: 5, resetAt: now - 1000 }
            ]])
            
            const result = enforceRateLimit('test-key', 5, 60000)
            expect(result.limited).toBe(false)
        })

        it('should handle exact limit', () => {
            for (let i = 0; i < 4; i++) {
                enforceRateLimit('test-key', 5, 60000)
            }
            
            const result = enforceRateLimit('test-key', 5, 60000)
            expect(result.limited).toBe(false)
        })

        it('should enforce minimum retryAfterSeconds of 1', () => {
            const now = Date.now()
            
            globalThis.__rateLimitStore = new Map([[
                'test-key',
                { count: 5, resetAt: now + 100 }
            ]])
            
            const result = enforceRateLimit('test-key', 5, 60000)
            expect(result.limited).toBe(true)
            expect(result.retryAfterSeconds).toBeGreaterThanOrEqual(1)
        })
    })
})

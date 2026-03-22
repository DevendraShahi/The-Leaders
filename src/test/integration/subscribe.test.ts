import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
    default: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/subscription-verification', async () => {
    const actual = await vi.importActual('@/lib/subscription-verification') as any
    return {
        ...actual,
        sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
    }
})

vi.mock('@/models/Subscriber', () => ({
    default: {
        create: vi.fn(),
        findOne: vi.fn(),
    },
}))

const createMockRequest = (options: {
    method?: string
    body?: any
    headers?: Record<string, string>
}) => {
    return new Request('http://localhost:3000/api/subscribe', {
        method: options.method || 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    })
}

describe('POST /api/subscribe - Validation', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        globalThis.__rateLimitStore = undefined
    })

    it('should return 400 for missing email', async () => {
        const { POST } = await import('@/app/api/subscribe/route')
        const req = createMockRequest({ body: {} })
        const res = await POST(req)
        
        expect(res.status).toBe(400)
        const data = await res.json()
        expect(data.error).toBe('Please provide a valid email address.')
    })

    it('should return 400 for invalid email format', async () => {
        const { POST } = await import('@/app/api/subscribe/route')
        const req = createMockRequest({ body: { email: 'invalid-email' } })
        const res = await POST(req)
        
        expect(res.status).toBe(400)
        const data = await res.json()
        expect(data.error).toBe('Please provide a valid email address.')
    })

    it('should return 400 for empty email', async () => {
        const { POST } = await import('@/app/api/subscribe/route')
        const req = createMockRequest({ body: { email: '' } })
        const res = await POST(req)
        
        expect(res.status).toBe(400)
    })

    it('should return 400 for whitespace-only email', async () => {
        const { POST } = await import('@/app/api/subscribe/route')
        const req = createMockRequest({ body: { email: '   ' } })
        const res = await POST(req)
        
        expect(res.status).toBe(400)
    })

    it('should return 400 for email without @', async () => {
        const { POST } = await import('@/app/api/subscribe/route')
        const req = createMockRequest({ body: { email: 'testexample.com' } })
        const res = await POST(req)
        
        expect(res.status).toBe(400)
    })

    it('should return 400 for email without domain', async () => {
        const { POST } = await import('@/app/api/subscribe/route')
        const req = createMockRequest({ body: { email: 'test@' } })
        const res = await POST(req)
        
        expect(res.status).toBe(400)
    })
})

describe('POST /api/subscribe - Rate Limiting', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        globalThis.__rateLimitStore = undefined
    })

    it('should return 429 when IP rate limit exceeded', async () => {
        const { POST } = await import('@/app/api/subscribe/route')
        
        for (let i = 0; i < 12; i++) {
            const req = createMockRequest({
                body: { email: `test${i}@example.com` },
                headers: { 'x-forwarded-for': '192.168.1.100' },
            })
            await POST(req)
        }

        const req = createMockRequest({
            body: { email: 'rate-limited@example.com' },
            headers: { 'x-forwarded-for': '192.168.1.100' },
        })
        const res = await POST(req)
        
        expect(res.status).toBe(429)
        const data = await res.json()
        expect(data.error).toContain('Too many')
        expect(res.headers.get('Retry-After')).toBeTruthy()
    })

    it('should allow requests within rate limit', async () => {
        const { POST } = await import('@/app/api/subscribe/route')
        
        for (let i = 0; i < 5; i++) {
            const req = createMockRequest({
                body: { email: `test${i}@example.com` },
                headers: { 'x-forwarded-for': `192.168.1.${101 + i}` },
            })
            const res = await POST(req)
            expect(res.status).not.toBe(429)
        }
    })

    it('should track different IPs separately', async () => {
        const { POST } = await import('@/app/api/subscribe/route')
        
        for (let i = 0; i < 12; i++) {
            const req = createMockRequest({
                body: { email: `test${i}@example.com` },
                headers: { 'x-forwarded-for': '192.168.1.102' },
            })
            await POST(req)
        }

        const req = createMockRequest({
            body: { email: 'different-ip@example.com' },
            headers: { 'x-forwarded-for': '192.168.1.103' },
        })
        const res = await POST(req)
        
        expect(res.status).not.toBe(429)
    })
})

describe('POST /api/subscribe - IP Detection', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        globalThis.__rateLimitStore = undefined
    })

    it('should use x-forwarded-for header for IP', async () => {
        const { POST } = await import('@/app/api/subscribe/route')
        
        for (let i = 0; i < 5; i++) {
            const req = createMockRequest({
                body: { email: `test${i}@example.com` },
                headers: { 'x-forwarded-for': `10.0.0.${i}` },
            })
            const res = await POST(req)
            expect(res.status).not.toBe(429)
        }
    })

    it('should use x-real-ip header as fallback', async () => {
        const { POST } = await import('@/app/api/subscribe/route')
        
        for (let i = 0; i < 5; i++) {
            const req = createMockRequest({
                body: { email: `realip${i}@example.com` },
                headers: { 'x-real-ip': `172.16.0.${i}` },
            })
            const res = await POST(req)
            expect(res.status).not.toBe(429)
        }
    })

    it('should use cf-connecting-ip header for Cloudflare', async () => {
        const { POST } = await import('@/app/api/subscribe/route')
        
        for (let i = 0; i < 5; i++) {
            const req = createMockRequest({
                body: { email: `cf${i}@example.com` },
                headers: { 'cf-connecting-ip': `203.0.113.${i}` },
            })
            const res = await POST(req)
            expect(res.status).not.toBe(429)
        }
    })
})

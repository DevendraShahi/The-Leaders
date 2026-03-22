import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
    default: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/subscription-verification', async () => {
    const actual = await vi.importActual('@/lib/subscription-verification') as any
    return {
        ...actual,
        sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
    }
})

vi.mock('@/models/Subscriber', () => ({
    default: {
        findOne: vi.fn(),
    },
}))

const createMockRequest = (options: {
    method?: string
    body?: any
    headers?: Record<string, string>
}) => {
    return new Request('http://localhost:3000/api/subscribe/verify', {
        method: options.method || 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    })
}

describe('POST /api/subscribe/verify - Validation', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        globalThis.__rateLimitStore = undefined
    })

    it('should return 400 for missing email and code', async () => {
        const { POST } = await import('@/app/api/subscribe/verify/route')
        const req = createMockRequest({ body: {} })
        const res = await POST(req)
        
        expect(res.status).toBe(400)
        const data = await res.json()
        expect(data.error).toBe('Invalid email or verification code.')
    })

    it('should return 400 for invalid email', async () => {
        const { POST } = await import('@/app/api/subscribe/verify/route')
        const req = createMockRequest({ body: { email: 'invalid', code: '123456' } })
        const res = await POST(req)
        
        expect(res.status).toBe(400)
    })

    it('should return 400 for invalid code format - too short', async () => {
        const { POST } = await import('@/app/api/subscribe/verify/route')
        const req = createMockRequest({ body: { email: 'test@example.com', code: '12345' } })
        const res = await POST(req)
        
        expect(res.status).toBe(400)
    })

    it('should return 400 for invalid code format - too long', async () => {
        const { POST } = await import('@/app/api/subscribe/verify/route')
        const req = createMockRequest({ body: { email: 'test@example.com', code: '1234567' } })
        const res = await POST(req)
        
        expect(res.status).toBe(400)
    })

    it('should return 400 for code with non-numeric characters', async () => {
        const { POST } = await import('@/app/api/subscribe/verify/route')
        const req = createMockRequest({ body: { email: 'test@example.com', code: '12345a' } })
        const res = await POST(req)
        
        expect(res.status).toBe(400)
    })

    it('should return 400 for missing code', async () => {
        const { POST } = await import('@/app/api/subscribe/verify/route')
        const req = createMockRequest({ body: { email: 'test@example.com' } })
        const res = await POST(req)
        
        expect(res.status).toBe(400)
    })

    it('should pass validation for valid email and code format', async () => {
        const { POST } = await import('@/app/api/subscribe/verify/route')
        const req = createMockRequest({ 
            body: { email: 'valid@example.com', code: '123456' },
            headers: { 'x-forwarded-for': '10.0.0.1' },
        })
        const res = await POST(req)
        
        expect(res.status).not.toBe(400)
    })
})

describe('POST /api/subscribe/verify - Rate Limiting', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        globalThis.__rateLimitStore = undefined
    })

    it('should return 429 when IP rate limit exceeded', async () => {
        const { POST } = await import('@/app/api/subscribe/verify/route')
        
        for (let i = 0; i < 20; i++) {
            const req = createMockRequest({
                body: { email: `test${i}@example.com`, code: '123456' },
                headers: { 'x-forwarded-for': '192.168.1.100' },
            })
            await POST(req)
        }

        const req = createMockRequest({
            body: { email: 'rate-limited@example.com', code: '123456' },
            headers: { 'x-forwarded-for': '192.168.1.100' },
        })
        const res = await POST(req)
        
        expect(res.status).toBe(429)
        const data = await res.json()
        expect(data.error).toContain('Too many')
    })

    it('should track different IPs separately', async () => {
        const { POST } = await import('@/app/api/subscribe/verify/route')
        
        for (let i = 0; i < 10; i++) {
            const req = createMockRequest({
                body: { email: `test${i}@example.com`, code: '123456' },
                headers: { 'x-forwarded-for': `192.168.1.${102 + i}` },
            })
            const res = await POST(req)
            expect(res.status).not.toBe(429)
        }
    })
})

describe('POST /api/subscribe/verify - Email Normalization', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        globalThis.__rateLimitStore = undefined
    })

    it('should accept uppercase email', async () => {
        const { POST } = await import('@/app/api/subscribe/verify/route')
        const req = createMockRequest({ 
            body: { email: 'TEST@EXAMPLE.COM', code: '123456' },
            headers: { 'x-forwarded-for': '10.0.0.1' },
        })
        const res = await POST(req)
        
        expect(res.status).not.toBe(400)
    })

    it('should accept email with whitespace', async () => {
        const { POST } = await import('@/app/api/subscribe/verify/route')
        const req = createMockRequest({ 
            body: { email: '  test@example.com  ', code: '123456' },
            headers: { 'x-forwarded-for': '10.0.0.2' },
        })
        const res = await POST(req)
        
        expect(res.status).not.toBe(400)
    })
})

describe('POST /api/subscribe/verify - IP Detection', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        globalThis.__rateLimitStore = undefined
    })

    it('should use x-forwarded-for header for IP', async () => {
        const { POST } = await import('@/app/api/subscribe/verify/route')
        
        for (let i = 0; i < 5; i++) {
            const req = createMockRequest({
                body: { email: `verify${i}@example.com`, code: '123456' },
                headers: { 'x-forwarded-for': `10.1.0.${i}` },
            })
            const res = await POST(req)
            expect(res.status).not.toBe(429)
        }
    })

    it('should use x-real-ip header as fallback', async () => {
        const { POST } = await import('@/app/api/subscribe/verify/route')
        
        for (let i = 0; i < 5; i++) {
            const req = createMockRequest({
                body: { email: `realverify${i}@example.com`, code: '123456' },
                headers: { 'x-real-ip': `172.17.0.${i}` },
            })
            const res = await POST(req)
            expect(res.status).not.toBe(429)
        }
    })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
    default: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/models/Contact', () => ({
    default: {
        create: vi.fn(),
        findByIdAndUpdate: vi.fn(),
    },
}))

vi.mock('@/lib/rate-limit', () => ({
    enforceRateLimit: vi.fn().mockReturnValue({ limited: false }),
    getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

const createMockRequest = (options: {
    method?: string
    body?: any
    headers?: Record<string, string>
}) => {
    return new Request('http://localhost:3000/api/contact', {
        method: options.method || 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    })
}

describe('POST /api/contact - Validation', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return 400 for missing name', async () => {
        const { POST } = await import('@/app/api/contact/route')
        const req = createMockRequest({ 
            body: { email: 'test@example.com', subject: 'Test', message: 'Hello' }
        })
        const res = await POST(req)
        expect(res.status).toBe(400)
    })

    it('should return 400 for missing email', async () => {
        const { POST } = await import('@/app/api/contact/route')
        const req = createMockRequest({ 
            body: { name: 'Test', subject: 'Test', message: 'Hello' }
        })
        const res = await POST(req)
        expect(res.status).toBe(400)
    })

    it('should return 400 for missing subject', async () => {
        const { POST } = await import('@/app/api/contact/route')
        const req = createMockRequest({ 
            body: { name: 'Test', email: 'test@example.com', message: 'Hello' }
        })
        const res = await POST(req)
        expect(res.status).toBe(400)
    })

    it('should return 400 for missing message', async () => {
        const { POST } = await import('@/app/api/contact/route')
        const req = createMockRequest({ 
            body: { name: 'Test', email: 'test@example.com', subject: 'Test' }
        })
        const res = await POST(req)
        expect(res.status).toBe(400)
    })
})

describe('POST /api/contact - Creation', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should create contact with all required fields', async () => {
        const { default: Contact } = await import('@/models/Contact')
        vi.mocked(Contact.create).mockResolvedValue({
            _id: 'new-contact-id',
            name: 'Test User',
            email: 'test@example.com',
            subject: 'Test Subject',
            message: 'Test message',
            status: 'new',
        } as any)

        const { POST } = await import('@/app/api/contact/route')
        const req = createMockRequest({
            body: {
                name: 'Test User',
                email: 'test@example.com',
                subject: 'Test Subject',
                message: 'Test message',
            }
        })
        const res = await POST(req)
        
        expect(res.status).toBe(201)
        const data = await res.json()
        expect(data.message).toBe('Message sent successfully')
        expect(data.contact).toBeDefined()
        expect(Contact.create).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Test User',
                email: 'test@example.com',
                subject: 'Test Subject',
                message: 'Test message',
                status: 'new',
            })
        )
    })

    it('should create contact with optional fields', async () => {
        const { default: Contact } = await import('@/models/Contact')
        vi.mocked(Contact.create).mockResolvedValue({
            _id: 'contact-with-optional',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+977-1234567890',
            location: 'Kathmandu',
            subject: 'Inquiry',
            message: 'Hello from Kathmandu.',
            feeling: 'hopeful',
            attachmentUrl: 'https://res.cloudinary.com/the-leaders/raw/upload/file.pdf',
            status: 'new',
        } as any)

        const { POST } = await import('@/app/api/contact/route')
        const req = createMockRequest({
            body: {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+977-1234567890',
                location: 'Kathmandu',
                subject: 'Inquiry',
                message: 'Hello from Kathmandu.',
                feeling: 'hopeful',
                attachmentUrl: 'https://res.cloudinary.com/the-leaders/raw/upload/file.pdf',
            }
        })
        const res = await POST(req)
        
        expect(res.status).toBe(201)
        expect(Contact.create).toHaveBeenCalledWith(
            expect.objectContaining({
                phone: '+977-1234567890',
                location: 'Kathmandu',
                feeling: 'hopeful',
                attachmentUrl: 'https://res.cloudinary.com/the-leaders/raw/upload/file.pdf',
            })
        )
    })
})

describe('PATCH /api/contact', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return 400 for missing id', async () => {
        const { PATCH } = await import('@/app/api/contact/route')
        const req = createMockRequest({
            method: 'PATCH',
            body: { feeling: 'hopeful' }
        })
        const res = await PATCH(req)
        
        expect(res.status).toBe(400)
        const data = await res.json()
        expect(data.error).toBe('Invalid feeling update')
    })

    it('should return 400 for missing feeling', async () => {
        const { PATCH } = await import('@/app/api/contact/route')
        const req = createMockRequest({
            method: 'PATCH',
            body: { id: '507f1f77bcf86cd799439011' }
        })
        const res = await PATCH(req)
        
        expect(res.status).toBe(400)
        const data = await res.json()
        expect(data.error).toBe('Invalid feeling update')
    })

    it('should return 404 for non-existent contact', async () => {
        const { default: Contact } = await import('@/models/Contact')
        vi.mocked(Contact.findByIdAndUpdate).mockResolvedValue(null as any)

        const { PATCH } = await import('@/app/api/contact/route')
        const req = createMockRequest({
            method: 'PATCH',
            body: { id: '507f1f77bcf86cd799439011', feeling: 'hopeful' }
        })
        const res = await PATCH(req)
        
        expect(res.status).toBe(404)
        const data = await res.json()
        expect(data.error).toBe('Contact not found')
    })

    it('should update contact feeling successfully', async () => {
        const { default: Contact } = await import('@/models/Contact')
        vi.mocked(Contact.findByIdAndUpdate).mockResolvedValue({
            _id: 'contact-id',
            name: 'Test User',
            feeling: 'hopeful',
        } as any)

        const { PATCH } = await import('@/app/api/contact/route')
        const req = createMockRequest({
            method: 'PATCH',
            body: { id: '507f1f77bcf86cd799439011', feeling: 'hopeful' }
        })
        const res = await PATCH(req)
        
        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data.message).toBe('Feeling updated successfully')
        expect(Contact.findByIdAndUpdate).toHaveBeenCalledWith(
            '507f1f77bcf86cd799439011',
            { feeling: 'hopeful' },
            { new: false }
        )
    })

    it('should handle different feeling values', async () => {
        const { default: Contact } = await import('@/models/Contact')
        vi.mocked(Contact.findByIdAndUpdate).mockResolvedValue({
            _id: 'contact-id',
            feeling: 'concerned',
        } as any)

        const { PATCH } = await import('@/app/api/contact/route')
        const req = createMockRequest({
            method: 'PATCH',
            body: { id: '507f1f77bcf86cd799439011', feeling: 'concerned' }
        })
        const res = await PATCH(req)
        
        expect(res.status).toBe(200)
    })
})

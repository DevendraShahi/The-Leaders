import { vi } from 'vitest'

vi.mock('@/lib/db', () => ({
    default: vi.fn().mockResolvedValue(undefined),
}))

export const mockSubscriberSave = vi.fn().mockResolvedValue(undefined)

const createMockQuery = (resolvedValue: any) => {
    const query = {
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        then: (resolve: any, reject: any) => {
            return Promise.resolve(resolvedValue).then(resolve).catch(reject)
        },
    }
    return query
}

const createMockSubscriber = (overrides: any = {}) => ({
    _id: 'mock-subscriber-id',
    email: 'test@example.com',
    isActive: false,
    isVerified: false,
    verificationCodeHash: 'mock-hash',
    verificationExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
    verificationSentAt: new Date(),
    verificationAttempts: 0,
    subscribedAt: new Date(),
    save: mockSubscriberSave,
    ...overrides,
})

export const mockSubscriberFindOne = vi.fn().mockImplementation(() => {
    return createMockQuery(null)
})

export const mockSubscriberCreate = vi.fn().mockImplementation(() => {
    return Promise.resolve(createMockSubscriber())
})

vi.mock('@/models/Subscriber', () => {
    const mockFindOne = vi.fn().mockImplementation(() => {
        return {
            select: vi.fn().mockImplementation(() => {
                return {
                    then: (resolve: any, reject: any) => {
                        return Promise.resolve(null).then(resolve).catch(reject)
                    }
                }
            })
        }
    })
    
    return {
        default: {
            create: vi.fn().mockResolvedValue({
                _id: 'new-subscriber-id',
                email: 'test@example.com',
                isActive: false,
                isVerified: false,
                save: mockSubscriberSave,
            }),
            findOne: mockFindOne,
        },
    }
})

export const mockContactCreate = vi.fn().mockResolvedValue({
    _id: 'mock-contact-id',
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Subject',
    message: 'Test message',
    status: 'new',
})

export const mockContactFindByIdAndUpdate = vi.fn()

vi.mock('@/models/Contact', () => ({
    default: {
        create: vi.fn().mockImplementation((data) => Promise.resolve({
            _id: 'mock-contact-id',
            ...data,
            status: 'new',
        })),
        findByIdAndUpdate: vi.fn().mockImplementation((id, data, options) => {
            return Promise.resolve({
                _id: id,
                ...data,
            })
        }),
    },
}))

export const mockSendVerificationEmail = vi.fn().mockResolvedValue(undefined)
export const mockSendWelcomeEmail = vi.fn().mockResolvedValue(undefined)

vi.mock('@/lib/subscription-verification', async () => {
    const actual = await vi.importActual('@/lib/subscription-verification') as any
    return {
        ...actual,
        sendVerificationEmail: mockSendVerificationEmail,
        sendWelcomeEmail: mockSendWelcomeEmail,
    }
})

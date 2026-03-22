import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { normalizeEmail, isValidEmail, generateVerificationCode, isValidVerificationCode, hashVerificationCode, getOtpExpiryDate, isResendCoolingDown, verificationConfig } from '@/lib/subscription-verification'

describe('subscription-verification utilities', () => {
    describe('normalizeEmail', () => {
        it('should trim and lowercase email', () => {
            expect(normalizeEmail('  Test@Example.COM  ')).toBe('test@example.com')
        })

        it('should handle already normalized email', () => {
            expect(normalizeEmail('test@example.com')).toBe('test@example.com')
        })

        it('should handle email with multiple spaces', () => {
            expect(normalizeEmail('test @ example . com')).toBe('test @ example . com')
        })
    })

    describe('isValidEmail', () => {
        it('should return true for valid emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true)
            expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
            expect(isValidEmail('user+tag@example.org')).toBe(true)
        })

        it('should return false for invalid emails', () => {
            expect(isValidEmail('invalid')).toBe(false)
            expect(isValidEmail('invalid@')).toBe(false)
            expect(isValidEmail('@domain.com')).toBe(false)
            expect(isValidEmail('user@')).toBe(false)
            expect(isValidEmail('')).toBe(false)
            expect(isValidEmail('user name@domain.com')).toBe(false)
        })

        it('should accept emails with subdomains', () => {
            expect(isValidEmail('user@mail.domain.com')).toBe(true)
        })
    })

    describe('generateVerificationCode', () => {
        it('should generate 6-digit code', () => {
            const code = generateVerificationCode()
            expect(code).toMatch(/^\d{6}$/)
        })

        it('should pad codes shorter than 6 digits', () => {
            vi.spyOn(Math, 'floor').mockReturnValueOnce(0)
            expect(generateVerificationCode()).toBe('000000')
            
            vi.spyOn(Math, 'floor').mockReturnValueOnce(5)
            expect(generateVerificationCode()).toBe('000005')
        })

        it('should generate various codes', () => {
            const codes = new Set<string>()
            for (let i = 0; i < 100; i++) {
                codes.add(generateVerificationCode())
            }
            expect(codes.size).toBeGreaterThan(1)
        })
    })

    describe('isValidVerificationCode', () => {
        it('should return true for valid 6-digit codes', () => {
            expect(isValidVerificationCode('123456')).toBe(true)
            expect(isValidVerificationCode('000000')).toBe(true)
            expect(isValidVerificationCode('999999')).toBe(true)
        })

        it('should return false for invalid codes', () => {
            expect(isValidVerificationCode('12345')).toBe(false)
            expect(isValidVerificationCode('1234567')).toBe(false)
            expect(isValidVerificationCode('12345a')).toBe(false)
            expect(isValidVerificationCode('')).toBe(false)
            expect(isValidVerificationCode('  123456  ')).toBe(true)
        })

        it('should trim whitespace', () => {
            expect(isValidVerificationCode('  123456')).toBe(true)
            expect(isValidVerificationCode('123456  ')).toBe(true)
        })
    })

    describe('hashVerificationCode', () => {
        it('should generate consistent hash for same input', () => {
            const hash1 = hashVerificationCode('test@example.com', '123456')
            const hash2 = hashVerificationCode('test@example.com', '123456')
            expect(hash1).toBe(hash2)
        })

        it('should generate different hash for different emails', () => {
            const hash1 = hashVerificationCode('test1@example.com', '123456')
            const hash2 = hashVerificationCode('test2@example.com', '123456')
            expect(hash1).not.toBe(hash2)
        })

        it('should generate different hash for different codes', () => {
            const hash1 = hashVerificationCode('test@example.com', '123456')
            const hash2 = hashVerificationCode('test@example.com', '654321')
            expect(hash1).not.toBe(hash2)
        })

        it('should return a valid hex string', () => {
            const hash = hashVerificationCode('test@example.com', '123456')
            expect(hash).toMatch(/^[a-f0-9]{64}$/)
        })

        it('should normalize email before hashing', () => {
            const hash1 = hashVerificationCode('TEST@EXAMPLE.COM', '123456')
            const hash2 = hashVerificationCode('test@example.com', '123456')
            expect(hash1).toBe(hash2)
        })
    })

    describe('getOtpExpiryDate', () => {
        it('should return a date in the future', () => {
            const now = Date.now()
            const expiry = getOtpExpiryDate()
            expect(expiry.getTime()).toBeGreaterThan(now)
        })

        it('should set expiry 15 minutes from now', () => {
            const before = Date.now()
            const expiry = getOtpExpiryDate()
            const after = Date.now()
            
            const expectedMin = before + 15 * 60 * 1000
            const expectedMax = after + 15 * 60 * 1000
            
            expect(expiry.getTime()).toBeGreaterThanOrEqual(expectedMin)
            expect(expiry.getTime()).toBeLessThanOrEqual(expectedMax)
        })
    })

    describe('isResendCoolingDown', () => {
        it('should return false when no sentAt provided', () => {
            expect(isResendCoolingDown(null)).toBe(false)
            expect(isResendCoolingDown(undefined)).toBe(false)
        })

        it('should return false when sentAt is old enough', () => {
            const sentAt = new Date(Date.now() - 120 * 1000)
            expect(isResendCoolingDown(sentAt)).toBe(false)
        })

        it('should return true when within cooldown period', () => {
            const sentAt = new Date(Date.now() - 30 * 1000)
            expect(isResendCoolingDown(sentAt)).toBe(true)
        })

        it('should return false when exactly at cooldown boundary', () => {
            const sentAt = new Date(Date.now() - 61 * 1000)
            expect(isResendCoolingDown(sentAt)).toBe(false)
        })

        it('should handle Date object correctly', () => {
            const sentAt = new Date(Date.now() - 30 * 1000)
            expect(isResendCoolingDown(sentAt)).toBe(true)
        })
    })

    describe('verificationConfig', () => {
        it('should return correct config values', () => {
            const config = verificationConfig()
            
            expect(config.otpLength).toBe(6)
            expect(config.otpTtlMinutes).toBe(15)
            expect(config.resendCooldownSeconds).toBe(60)
            expect(config.maxVerificationAttempts).toBe(5)
        })
    })
})

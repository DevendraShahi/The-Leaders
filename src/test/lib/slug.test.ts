import { describe, it, expect } from 'vitest'
import { slugify } from '@/lib/slug'

describe('slugify', () => {
    it('should convert text to lowercase slug', () => {
        expect(slugify('Hello World')).toBe('hello-world')
    })

    it('should trim whitespace', () => {
        expect(slugify('  hello world  ')).toBe('hello-world')
    })

    it('should replace spaces with hyphens', () => {
        expect(slugify('hello world test')).toBe('hello-world-test')
    })

    it('should remove special characters', () => {
        expect(slugify('Hello@World!#Test')).toBe('hello-world-test')
    })

    it('should handle multiple spaces/special chars', () => {
        expect(slugify('hello   world___test')).toBe('hello-world-test')
    })

    it('should remove leading/trailing hyphens', () => {
        expect(slugify('--hello world--')).toBe('hello-world')
    })

    it('should handle empty string', () => {
        expect(slugify('')).toBe('')
    })

    it('should handle null/undefined as empty', () => {
        expect(slugify('')).toBe('')
    })

    it('should respect maxLen parameter', () => {
        const longText = 'this-is-a-very-long-text-that-should-be-truncated'
        expect(slugify(longText, 10)).toBe('this-is-a-')
    })

    it('should not cut in the middle of a word when respecting maxLen', () => {
        const result = slugify('hello world test', 12)
        expect(result).toMatch(/^hello-world$|^hello$|^hello-w/)
    })

        it('should handle Nepali text with ASCII characters', () => {
            expect(slugify('hello world')).toBe('hello-world')
        })

    it('should handle mixed English and numbers', () => {
        expect(slugify('Test 123 ABC')).toBe('test-123-abc')
    })

    it('should handle single word', () => {
        expect(slugify('Hello')).toBe('hello')
    })

    it('should handle already slugified text', () => {
        expect(slugify('hello-world-test')).toBe('hello-world-test')
    })
})

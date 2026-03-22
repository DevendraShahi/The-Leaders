import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn (className utility)', () => {
    it('should merge class names', () => {
        const result = cn('foo', 'bar')
        expect(result).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
        const isActive = true
        const result = cn('base', isActive && 'active')
        expect(result).toContain('base')
        expect(result).toContain('active')
    })

    it('should handle falsy values', () => {
        const result = cn('foo', false, null, undefined, '', 'bar')
        expect(result).toBe('foo bar')
    })

    it('should merge Tailwind classes intelligently', () => {
        const result = cn('px-2 px-4', 'py-2 py-4')
        expect(result).toContain('px-4')
        expect(result).toContain('py-4')
    })

    it('should handle empty input', () => {
        const result = cn()
        expect(result).toBe('')
    })

    it('should handle objects (clsx pattern)', () => {
        const result = cn({ foo: true, bar: false, baz: true })
        expect(result).toContain('foo')
        expect(result).toContain('baz')
        expect(result).not.toContain('bar')
    })

    it('should handle arrays', () => {
        const result = cn(['foo', 'bar'], 'baz')
        expect(result).toContain('foo')
        expect(result).toContain('bar')
        expect(result).toContain('baz')
    })
})

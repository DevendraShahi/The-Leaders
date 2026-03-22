import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
    it('renders with default variant and size', () => {
        render(<Button>Click me</Button>)
        const button = screen.getByRole('button', { name: /click me/i })
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute('data-variant', 'default')
        expect(button).toHaveAttribute('data-size', 'default')
    })

    it('renders with different variants', () => {
        const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const
        
        variants.forEach(variant => {
            const { container } = render(<Button variant={variant}>Button</Button>)
            const button = container.querySelector('button')
            expect(button).toHaveAttribute('data-variant', variant)
        })
    })

    it('renders with different sizes', () => {
        const sizes = ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'] as const
        
        sizes.forEach(size => {
            const { container } = render(<Button size={size}>Button</Button>)
            const button = container.querySelector('button')
            expect(button).toHaveAttribute('data-size', size)
        })
    })

    it('handles click events', () => {
        const handleClick = vi.fn()
        render(<Button onClick={handleClick}>Click me</Button>)
        
        fireEvent.click(screen.getByRole('button'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', () => {
        const handleClick = vi.fn()
        render(<Button onClick={handleClick} disabled>Click me</Button>)
        
        const button = screen.getByRole('button')
        fireEvent.click(button)
        expect(handleClick).not.toHaveBeenCalled()
        expect(button).toBeDisabled()
    })

    it('applies custom className', () => {
        const { container } = render(<Button className="custom-class">Click me</Button>)
        const button = container.querySelector('button')
        expect(button).toHaveClass('custom-class')
    })

    it('renders as child when asChild is true', () => {
        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>
        )
        const link = screen.getByRole('link', { name: /link button/i })
        expect(link).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
        const ref = { current: null } as any
        render(<Button ref={ref}>Click me</Button>)
        expect(ref.current).not.toBeNull()
    })

    it('has correct data-slot attribute', () => {
        const { container } = render(<Button>Click me</Button>)
        const button = container.querySelector('button')
        expect(button).toHaveAttribute('data-slot', 'button')
    })
})

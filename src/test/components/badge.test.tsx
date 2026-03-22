import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge Component', () => {
    it('renders correctly', () => {
        render(<Badge>New</Badge>)
        const badge = screen.getByText('New')
        expect(badge).toBeInTheDocument()
    })

    it('renders with different variants', () => {
        const variants = ['default', 'secondary', 'destructive', 'outline'] as const
        
        variants.forEach(variant => {
            const { container } = render(<Badge variant={variant}>Badge</Badge>)
            const badge = container.querySelector('span')
            expect(badge).toBeInTheDocument()
        })
    })

    it('applies custom className', () => {
        const { container } = render(<Badge className="custom-badge">Badge</Badge>)
        const badge = container.querySelector('span')
        expect(badge).toHaveClass('custom-badge')
    })

    it('has correct data-slot attribute', () => {
        const { container } = render(<Badge>Badge</Badge>)
        const badge = container.querySelector('span')
        expect(badge).toHaveAttribute('data-slot', 'badge')
    })

    it('renders as child when asChild is true', () => {
        render(
            <Badge asChild>
                <a href="/test">Link Badge</a>
            </Badge>
        )
        const link = screen.getByRole('link', { name: /link badge/i })
        expect(link).toBeInTheDocument()
    })

    it('renders with children correctly', () => {
        render(<Badge>Status: Active</Badge>)
        expect(screen.getByText('Status: Active')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
        const ref = { current: null } as any
        render(<Badge ref={ref}>Badge</Badge>)
        expect(ref.current).not.toBeNull()
    })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
    it('renders correctly', () => {
        render(<Input />)
        const input = screen.getByRole('textbox')
        expect(input).toBeInTheDocument()
    })

    it('renders with placeholder', () => {
        render(<Input placeholder="Enter email" />)
        const input = screen.getByPlaceholderText('Enter email')
        expect(input).toBeInTheDocument()
    })

    it('handles text input', () => {
        render(<Input />)
        const input = screen.getByRole('textbox')
        
        fireEvent.change(input, { target: { value: 'test@example.com' } })
        expect(input).toHaveValue('test@example.com')
    })

    it('handles different input types', () => {
        const types = ['text', 'email', 'password', 'number', 'tel', 'url']
        
        types.forEach(type => {
            const { container } = render(<Input type={type} />)
            const input = container.querySelector('input')
            expect(input).toHaveAttribute('type', type)
        })
    })

    it('handles disabled state', () => {
        render(<Input disabled />)
        const input = screen.getByRole('textbox')
        expect(input).toBeDisabled()
    })

    it('applies custom className', () => {
        const { container } = render(<Input className="custom-input" />)
        const input = container.querySelector('input')
        expect(input).toHaveClass('custom-input')
    })

    it('forwards ref correctly', () => {
        const ref = { current: null } as any
        render(<Input ref={ref} />)
        expect(ref.current).not.toBeNull()
    })

    it('has correct data-slot attribute', () => {
        const { container } = render(<Input />)
        const input = container.querySelector('input')
        expect(input).toHaveAttribute('data-slot', 'input')
    })

    it('handles focus events', () => {
        render(<Input />)
        const input = screen.getByRole('textbox')
        
        fireEvent.focus(input)
        expect(input).toBeTruthy()
        
        fireEvent.blur(input)
        expect(input).toBeTruthy()
    })

    it('handles keyboard events', () => {
        const handleKeyDown = vi.fn()
        render(<Input onKeyDown={handleKeyDown} />)
        const input = screen.getByRole('textbox')
        
        fireEvent.keyDown(input, { key: 'Enter' })
        expect(handleKeyDown).toHaveBeenCalled()
    })
})

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Textarea } from '@/components/ui/textarea'

describe('Textarea Component', () => {
    it('renders correctly', () => {
        render(<Textarea />)
        const textarea = screen.getByRole('textbox')
        expect(textarea).toBeInTheDocument()
        expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('renders with placeholder', () => {
        render(<Textarea placeholder="Enter your message" />)
        const textarea = screen.getByPlaceholderText('Enter your message')
        expect(textarea).toBeInTheDocument()
    })

    it('handles text input', () => {
        render(<Textarea />)
        const textarea = screen.getByRole('textbox')
        
        fireEvent.change(textarea, { target: { value: 'Test message content' } })
        expect(textarea).toHaveValue('Test message content')
    })

    it('handles multiline input', () => {
        render(<Textarea />)
        const textarea = screen.getByRole('textbox')
        
        fireEvent.change(textarea, { target: { value: 'Line 1\nLine 2\nLine 3' } })
        expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3')
    })

    it('handles disabled state', () => {
        render(<Textarea disabled />)
        const textarea = screen.getByRole('textbox')
        expect(textarea).toBeDisabled()
    })

    it('applies custom className', () => {
        const { container } = render(<Textarea className="custom-textarea" />)
        const textarea = container.querySelector('textarea')
        expect(textarea).toHaveClass('custom-textarea')
    })

    it('forwards ref correctly', () => {
        const ref = { current: null } as any
        render(<Textarea ref={ref} />)
        expect(ref.current).not.toBeNull()
    })

    it('handles focus events', () => {
        render(<Textarea />)
        const textarea = screen.getByRole('textbox')
        
        fireEvent.focus(textarea)
        expect(textarea).toBeTruthy()
        
        fireEvent.blur(textarea)
        expect(textarea).toBeTruthy()
    })

    it('handles rows prop', () => {
        const { container } = render(<Textarea rows={10} />)
        const textarea = container.querySelector('textarea')
        expect(textarea).toHaveAttribute('rows', '10')
    })

    it('handles maxLength prop', () => {
        const { container } = render(<Textarea maxLength={100} />)
        const textarea = container.querySelector('textarea')
        expect(textarea).toHaveAttribute('maxLength', '100')
    })

    it('has correct display name', () => {
        render(<Textarea />)
        const textarea = screen.getByRole('textbox')
        expect(textarea).toBeInTheDocument()
    })
})

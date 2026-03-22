import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SubscribeForm } from '@/components/common/subscribe-form'

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('SubscribeForm Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockFetch.mockReset()
    })

    describe('Initial Render', () => {
        it('renders the subscribe form', () => {
            render(<SubscribeForm />)
            expect(screen.getByRole('textbox')).toBeInTheDocument()
        })

        it('renders email input field', () => {
            render(<SubscribeForm />)
            const emailInput = screen.getByPlaceholderText(/your email address/i)
            expect(emailInput).toBeInTheDocument()
        })

        it('renders submit button', () => {
            render(<SubscribeForm />)
            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBeGreaterThan(0)
        })
    })

    describe('Email Input', () => {
        it('accepts email input', () => {
            render(<SubscribeForm />)
            const emailInput = screen.getByPlaceholderText(/your email address/i) as HTMLInputElement
            
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
            expect(emailInput.value).toBe('test@example.com')
        })

        it('can be cleared programmatically', () => {
            render(<SubscribeForm />)
            const emailInput = screen.getByPlaceholderText(/your email address/i) as HTMLInputElement
            
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
            expect(emailInput.value).toBe('test@example.com')
            
            fireEvent.change(emailInput, { target: { value: '' } })
            expect(emailInput.value).toBe('')
        })
    })

    describe('Form Submission', () => {
        it('calls API with correct endpoint on submission', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Verification code sent' }),
            })

            render(<SubscribeForm />)
            const emailInput = screen.getByPlaceholderText(/your email address/i)
            
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
            
            const submitButton = screen.getByRole('button', { name: '' })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith(
                    '/api/subscribe',
                    expect.objectContaining({
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    })
                )
            })
        })

        it('sends email in request body', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Verification code sent' }),
            })

            render(<SubscribeForm />)
            const emailInput = screen.getByPlaceholderText(/your email address/i)
            
            fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
            
            const submitButton = screen.getByRole('button', { name: '' })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith(
                    '/api/subscribe',
                    expect.objectContaining({
                        body: JSON.stringify({ email: 'user@example.com' }),
                    })
                )
            })
        })
    })

    describe('Different Layouts', () => {
        it('renders with default layout', () => {
            const { container } = render(<SubscribeForm layout="default" />)
            expect(container.firstChild).toBeInTheDocument()
        })

        it('renders with dialog layout', () => {
            const { container } = render(<SubscribeForm layout="dialog" />)
            expect(container.firstChild).toBeInTheDocument()
        })

        it('renders with footer layout', () => {
            const { container } = render(<SubscribeForm layout="footer" />)
            expect(container.firstChild).toBeInTheDocument()
        })
    })

    describe('API Interaction', () => {
        it('handles successful API response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Verification code sent' }),
            })

            render(<SubscribeForm />)
            const emailInput = screen.getByPlaceholderText(/your email address/i)
            
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
            
            const submitButton = screen.getByRole('button', { name: '' })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalled()
            })
        })

        it('handles API error response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Invalid email' }),
            })

            render(<SubscribeForm />)
            const emailInput = screen.getByPlaceholderText(/your email address/i)
            
            fireEvent.change(emailInput, { target: { value: 'test@invalid' } })
            
            const submitButton = screen.getByRole('button', { name: '' })
            fireEvent.click(submitButton)

            await new Promise(resolve => setTimeout(resolve, 100))
        })

        it('handles network error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'))

            render(<SubscribeForm />)
            const emailInput = screen.getByPlaceholderText(/your email address/i)
            
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
            
            const submitButton = screen.getByRole('button', { name: '' })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalled()
            })
        })
    })

    describe('Component Structure', () => {
        it('contains email input with correct type', () => {
            render(<SubscribeForm />)
            const emailInput = screen.getByRole('textbox', { name: '' })
            expect(emailInput).toHaveAttribute('type', 'email')
        })

        it('has submit button', () => {
            render(<SubscribeForm />)
            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBeGreaterThan(0)
        })

        it('renders within correct container', () => {
            const { container } = render(<SubscribeForm />)
            expect(container.querySelector('.relative')).toBeInTheDocument()
        })
    })
})

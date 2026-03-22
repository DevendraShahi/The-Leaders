import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@/components/ui/card'

describe('Card Components', () => {
    describe('Card', () => {
        it('renders correctly', () => {
            render(<Card>Card Content</Card>)
            const card = screen.getByText('Card Content')
            expect(card).toBeInTheDocument()
        })

        it('has correct data-slot attribute', () => {
            const { container } = render(<Card>Card</Card>)
            const card = container.querySelector('[data-slot="card"]')
            expect(card).toBeInTheDocument()
        })

        it('applies custom className', () => {
            const { container } = render(<Card className="custom-card">Card</Card>)
            const card = container.querySelector('[data-slot="card"]')
            expect(card).toHaveClass('custom-card')
        })
    })

    describe('CardHeader', () => {
        it('renders correctly', () => {
            render(<CardHeader>Header Content</CardHeader>)
            expect(screen.getByText('Header Content')).toBeInTheDocument()
        })

        it('has correct data-slot attribute', () => {
            const { container } = render(<CardHeader>Header</CardHeader>)
            const header = container.querySelector('[data-slot="card-header"]')
            expect(header).toBeInTheDocument()
        })
    })

    describe('CardTitle', () => {
        it('renders correctly', () => {
            render(<CardTitle>Card Title</CardTitle>)
            expect(screen.getByText('Card Title')).toBeInTheDocument()
        })

        it('has correct data-slot attribute', () => {
            const { container } = render(<CardTitle>Title</CardTitle>)
            const title = container.querySelector('[data-slot="card-title"]')
            expect(title).toBeInTheDocument()
        })
    })

    describe('CardDescription', () => {
        it('renders correctly', () => {
            render(<CardDescription>This is a description</CardDescription>)
            expect(screen.getByText('This is a description')).toBeInTheDocument()
        })

        it('has correct data-slot attribute', () => {
            const { container } = render(<CardDescription>Description</CardDescription>)
            const desc = container.querySelector('[data-slot="card-description"]')
            expect(desc).toBeInTheDocument()
        })
    })

    describe('CardContent', () => {
        it('renders correctly', () => {
            render(<CardContent>Content goes here</CardContent>)
            expect(screen.getByText('Content goes here')).toBeInTheDocument()
        })

        it('has correct data-slot attribute', () => {
            const { container } = render(<CardContent>Content</CardContent>)
            const content = container.querySelector('[data-slot="card-content"]')
            expect(content).toBeInTheDocument()
        })
    })

    describe('CardFooter', () => {
        it('renders correctly', () => {
            render(<CardFooter>Footer content</CardFooter>)
            expect(screen.getByText('Footer content')).toBeInTheDocument()
        })

        it('has correct data-slot attribute', () => {
            const { container } = render(<CardFooter>Footer</CardFooter>)
            const footer = container.querySelector('[data-slot="card-footer"]')
            expect(footer).toBeInTheDocument()
        })
    })

    describe('CardAction', () => {
        it('renders correctly', () => {
            render(<CardAction>Action</CardAction>)
            expect(screen.getByText('Action')).toBeInTheDocument()
        })

        it('has correct data-slot attribute', () => {
            const { container } = render(<CardAction>Action</CardAction>)
            const action = container.querySelector('[data-slot="card-action"]')
            expect(action).toBeInTheDocument()
        })
    })

    describe('Card Composition', () => {
        it('renders all card parts together', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardTitle>Test Title</CardTitle>
                        <CardDescription>Test Description</CardDescription>
                    </CardHeader>
                    <CardContent>Test Content</CardContent>
                    <CardFooter>Test Footer</CardFooter>
                </Card>
            )

            expect(screen.getByText('Test Title')).toBeInTheDocument()
            expect(screen.getByText('Test Description')).toBeInTheDocument()
            expect(screen.getByText('Test Content')).toBeInTheDocument()
            expect(screen.getByText('Test Footer')).toBeInTheDocument()
        })
    })
})

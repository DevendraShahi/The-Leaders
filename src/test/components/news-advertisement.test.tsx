import { echo11Lines, echo11Variant } from '@/lib/post-studio/echo11-copy';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Artwork } from '@/components/admin/post-studio/Artwork';
import { newsSample, newsStyles } from '@/lib/post-studio/news-design';
afterEach(cleanup);
describe('News echo11 advertisement', () => {
    for (const language of ['en', 'ne'] as const) it.each(newsStyles)(`$title includes the agency banner (${language})`, ({ id }) => {
        render(<Artwork design={newsSample(id, 'portrait', language)} />);
        const banner = screen.getByTestId('echo11-promotion');
        expect(banner).toHaveAccessibleName('echo11 · Web development advertisement');
        expect(within(banner).getByAltText('echo11 logo')).toBeInTheDocument();
        expect(within(banner).getByRole('link', { name: /echo11.tech/ })).toHaveAttribute('href', 'https://echo11.tech/');
        expect(within(banner).getByRole('link', { name: 'echo11.labs@gmail.com' })).toHaveAttribute('href', 'mailto:echo11.labs@gmail.com');
        expect(banner.textContent).toContain(echo11Lines[echo11Variant(undefined, newsSample(id, 'portrait', language).headline)][language]);
        expect(within(banner).getByTestId('echo11-subtext')).toHaveTextContent(echo11Lines[echo11Variant(undefined, newsSample(id, 'portrait', language).headline)].subtext[language]);
        expect(within(banner).getByTestId('echo11-ad-illustration')).toHaveAttribute('href', 'mailto:echo11.labs@gmail.com');
        expect(screen.getByTestId('news-editorial-frame')).not.toContainElement(banner);
    });
});

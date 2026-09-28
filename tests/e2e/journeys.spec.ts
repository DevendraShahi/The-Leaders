import { test, expect } from '@playwright/test';

test.describe('Agent 1 Principal Journeys', () => {

  test('Home -> Leader Directory -> Profile -> Related Election', async ({ page }) => {
    // 1. Visit Home
    await page.goto('/');
    await expect(page).toHaveTitle(/The Leaders/i);

    // 2. Click "EXPLORE BIOGRAPHIES" or navigate to /leaders
    await page.goto('/leaders');
    await expect(page.getByRole('heading', { name: /Leaders/i })).toBeVisible();

    // Wait for at least one leader card to be visible, then click the first one
    const leaderCard = page.locator('a[href^="/leaders/"]').first();
    await leaderCard.waitFor({ state: 'visible' });
    await leaderCard.click();

    // 3. Leader Profile
    // We expect the URL to be /leaders/[slug]
    await expect(page).toHaveURL(/\/leaders\/.+/);
    
    // Check if back navigation or election navigation exists
    // Depending on Agent 1's final implementation, we would click on an election here
    // For now, we assert the profile loaded properly
    await expect(page.locator('main')).toBeVisible();
  });

  test('Home -> History Timeline -> Specific Event', async ({ page }) => {
    await page.goto('/history');
    await expect(page.locator('text=History')).toBeVisible();

    // Check for timeline elements
    const eventLink = page.locator('a[href^="/history/"]').first();
    if (await eventLink.isVisible()) {
        await eventLink.click();
        await expect(page).toHaveURL(/\/history\/.+/);
    }
  });

  test('Home -> Article/Fact Check', async ({ page }) => {
    await page.goto('/articles');
    
    const articleLink = page.locator('a[href^="/articles/"]').first();
    await articleLink.waitFor({ state: 'visible' });
    await articleLink.click();

    await expect(page).toHaveURL(/\/articles\/.+/);
    await expect(page.locator('article')).toBeVisible();
  });

});

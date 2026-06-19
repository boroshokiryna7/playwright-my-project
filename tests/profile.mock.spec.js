const { test, expect } = require('@playwright/test');
const { loginPageByApi } = require('./userGarage.fixture');

test.describe('QAuto profile network mocking', () => {
  test('shows user profile data from mocked response body', async ({ page }) => {
    const mockedProfile = {
      status: 'ok',
      data: {
        userId: 1,
        photoFilename: 'default-user.png',
        name: 'Mocked',
        lastName: 'Profile',
      },
    };

    await page.route('**/api/users/profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: mockedProfile,
      });
    });

    await loginPageByApi(page);

    await page.goto('/panel/profile');

    await expect(
      page.getByText(`${mockedProfile.data.name} ${mockedProfile.data.lastName}`, { exact: true }),
    ).toBeVisible();
  });
});

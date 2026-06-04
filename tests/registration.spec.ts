import { expect, type Locator, type Page, test } from '@playwright/test';

const fields = {
  name: '#signupName',
  lastName: '#signupLastName',
  email: '#signupEmail',
  password: '#signupPassword',
  repeatPassword: '#signupRepeatPassword',
};

const passwordRulesError =
  'Password has to be from 8 to 15 characters long and contain at least one integer, one capital, and one small letter';

const baseUrl = 'https://qauto.forstudy.space';

test.use({
  httpCredentials: {
    username: 'guest',
    password: 'welcome2qauto',
  },
});

function getRandomEmail(): string {
  return `aqa-codex-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`;
}

async function openRegistrationForm(page: Page): Promise<Locator> {
  await page.goto(baseUrl);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: 'Registration' }).click();

  const modal = page.locator('.modal-content').filter({ hasText: 'Registration' }).last();
  await expect(modal.getByRole('heading', { name: 'Registration' })).toBeVisible();
  return modal;
}

async function fillRegistrationForm(
  modal: Locator,
  user: {
    name: string;
    lastName: string;
    email: string;
    password: string;
    repeatPassword: string;
  },
): Promise<void> {
  await modal.locator(fields.name).fill(user.name);
  await modal.locator(fields.lastName).fill(user.lastName);
  await modal.locator(fields.email).fill(user.email);
  await modal.locator(fields.password).fill(user.password);
  await modal.locator(fields.repeatPassword).fill(user.repeatPassword);
}

async function blurField(modal: Locator, selector: string): Promise<void> {
  await modal.locator(selector).focus();
  await modal.locator(selector).blur();
}

async function expectInvalidField(modal: Locator, selector: string, message: string): Promise<void> {
  await expect(modal.getByText(message, { exact: true })).toBeVisible();
  await expect(modal.locator(selector)).toHaveClass(/is-invalid/);
  await expect(modal.getByRole('button', { name: 'Register' })).toBeDisabled();
}

test.describe('QAuto registration form', () => {
  test('registers a new user with valid data', async ({ page }) => {
    const modal = await openRegistrationForm(page);
    const email = getRandomEmail();
    const password = 'Password1';

    await fillRegistrationForm(modal, {
      name: 'Anna',
      lastName: 'Tester',
      email,
      password,
      repeatPassword: password,
    });

    await expect(modal.getByRole('button', { name: 'Register' })).toBeEnabled();
    await modal.getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL(/\/panel\/garage/);
    await expect(page.getByRole('button', { name: 'Add car' })).toBeVisible();
  });

  test('shows required errors for empty mandatory fields', async ({ page }) => {
    const modal = await openRegistrationForm(page);

    await blurField(modal, fields.name);
    await expectInvalidField(modal, fields.name, 'Name required');

    await blurField(modal, fields.lastName);
    await expectInvalidField(modal, fields.lastName, 'Last name required');

    await blurField(modal, fields.email);
    await expectInvalidField(modal, fields.email, 'Email required');

    await blurField(modal, fields.password);
    await expectInvalidField(modal, fields.password, 'Password required');

    await blurField(modal, fields.repeatPassword);
    await expectInvalidField(modal, fields.repeatPassword, 'Re-enter password required');
  });

  test('validates name format and length', async ({ page }) => {
    const modal = await openRegistrationForm(page);

    await modal.locator(fields.name).fill('A');
    await modal.locator(fields.name).blur();
    await expectInvalidField(modal, fields.name, 'Name has to be from 2 to 20 characters long');

    await modal.locator(fields.name).fill('Anna1');
    await modal.locator(fields.name).blur();
    await expectInvalidField(modal, fields.name, 'Name is invalid');
  });

  test('rejects Cyrillic characters in name', async ({ page }) => {
    const modal = await openRegistrationForm(page);

    await modal.locator(fields.name).fill('Іван');
    await modal.locator(fields.name).blur();
    await expectInvalidField(modal, fields.name, 'Name is invalid');

    await modal.locator(fields.name).fill('Иван');
    await modal.locator(fields.name).blur();
    await expectInvalidField(modal, fields.name, 'Name is invalid');
  });

  test('validates last name format and length', async ({ page }) => {
    const modal = await openRegistrationForm(page);

    await modal.locator(fields.lastName).fill('B'.repeat(21));
    await modal.locator(fields.lastName).blur();
    await expectInvalidField(modal, fields.lastName, 'Last name has to be from 2 to 20 characters long');

    await modal.locator(fields.lastName).fill('Tester1');
    await modal.locator(fields.lastName).blur();
    await expectInvalidField(modal, fields.lastName, 'Last name is invalid');
  });

  test('validates incorrect email', async ({ page }) => {
    const modal = await openRegistrationForm(page);

    await modal.locator(fields.email).fill('aqa-codex-email');
    await modal.locator(fields.email).blur();

    await expectInvalidField(modal, fields.email, 'Email is incorrect');
  });

  test('rejects email with spaces inside', async ({ page }) => {
    const modal = await openRegistrationForm(page);

    await modal.locator(fields.email).fill('test @domain.com');
    await modal.locator(fields.email).blur();

    await expectInvalidField(modal, fields.email, 'Email is incorrect');
  });

  test('shows errors when user enters incorrect registration data', async ({ page }) => {
    const modal = await openRegistrationForm(page);

    await fillRegistrationForm(modal, {
      name: 'Anna1',
      lastName: 'Tester1',
      email: 'aqa-codex-email',
      password: 'password',
      repeatPassword: 'Password2',
    });

    await blurField(modal, fields.name);
    await blurField(modal, fields.lastName);
    await blurField(modal, fields.email);
    await blurField(modal, fields.password);
    await blurField(modal, fields.repeatPassword);

    await expectInvalidField(modal, fields.name, 'Name is invalid');
    await expectInvalidField(modal, fields.lastName, 'Last name is invalid');
    await expectInvalidField(modal, fields.email, 'Email is incorrect');
    await expectInvalidField(modal, fields.password, passwordRulesError);
    await expectInvalidField(modal, fields.repeatPassword, 'Passwords do not match');
  });

  test('validates password rules', async ({ page }) => {
    const modal = await openRegistrationForm(page);

    await modal.locator(fields.password).fill('password');
    await modal.locator(fields.password).blur();

    await expectInvalidField(modal, fields.password, passwordRulesError);
  });

  test('rejects password with only special characters', async ({ page }) => {
    const modal = await openRegistrationForm(page);

    await modal.locator(fields.password).fill('!@#$%^&*()_+');
    await modal.locator(fields.password).blur();

    await expectInvalidField(modal, fields.password, passwordRulesError);
  });

  test('validates repeated password match', async ({ page }) => {
    const modal = await openRegistrationForm(page);

    await modal.locator(fields.password).fill('Password1');
    await modal.locator(fields.repeatPassword).fill('Password2');
    await modal.locator(fields.repeatPassword).blur();

    await expectInvalidField(modal, fields.repeatPassword, 'Passwords do not match');
  });

  test('disables Register button and does not send request when any field is invalid', async ({ page }) => {
    let signupRequestWasSent = false;

    await page.route('**/api/auth/signup', async route => {
      signupRequestWasSent = true;
      await route.fulfill({ status: 500, body: 'Unexpected signup request' });
    });

    const modal = await openRegistrationForm(page);
    const registerButton = modal.getByRole('button', { name: 'Register' });

    await fillRegistrationForm(modal, {
      name: 'Anna',
      lastName: 'Tester',
      email: getRandomEmail(),
      password: 'Password1',
      repeatPassword: 'Password1',
    });

    await expect(registerButton).toBeEnabled();

    await modal.locator(fields.email).fill('test @domain.com');
    await modal.locator(fields.email).blur();

    await expectInvalidField(modal, fields.email, 'Email is incorrect');
    await expect(registerButton).toBeDisabled();
    expect(signupRequestWasSent).toBe(false);
  });

  test('does not allow registration with an existing email', async ({ page, request }) => {
    const email = getRandomEmail();
    const password = 'Password1';

    const response = await request.post(`${baseUrl}/api/auth/signup`, {
      data: {
        name: 'Anna',
        lastName: 'Tester',
        email,
        password,
        repeatPassword: password,
      },
    });
    await expect(response).toBeOK();

    const modal = await openRegistrationForm(page);
    await fillRegistrationForm(modal, {
      name: 'Anna',
      lastName: 'Tester',
      email,
      password,
      repeatPassword: password,
    });

    await expect(modal.getByRole('button', { name: 'Register' })).toBeEnabled();
    await modal.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('User already exists', { exact: true })).toBeVisible();
    await expect(page).not.toHaveURL(/\/panel\/garage/);
  });
});

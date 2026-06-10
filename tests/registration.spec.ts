import { expect, test } from '@playwright/test';
import { RegistrationPage } from './pageObjects/RegistrationPage';

const passwordRulesError =
  'Password has to be from 8 to 15 characters long and contain at least one integer, one capital, and one small letter';

function getRandomEmail(): string {
  return `aqa-codex-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`;
}

test.describe('QAuto registration form', () => {
  test('registers a new user with valid data', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    const email = getRandomEmail();
    const password = 'Password1';

    await registrationPage.open();
    await registrationPage.fillForm({
      name: 'Anna',
      lastName: 'Tester',
      email,
      password,
      repeatPassword: password,
    });

    await expect(registrationPage.registerButton).toBeEnabled();
    await registrationPage.submit();

    await expect(page).toHaveURL(/\/panel\/garage/);
    await expect(page.getByRole('button', { name: 'Add car' })).toBeVisible();
  });

  test('shows required errors for empty mandatory fields', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);

    await registrationPage.open();

    await registrationPage.blurName();
    await registrationPage.expectInvalidField(registrationPage.nameInput, 'Name required');

    await registrationPage.blurLastName();
    await registrationPage.expectInvalidField(registrationPage.lastNameInput, 'Last name required');

    await registrationPage.blurEmail();
    await registrationPage.expectInvalidField(registrationPage.emailInput, 'Email required');

    await registrationPage.blurPassword();
    await registrationPage.expectInvalidField(registrationPage.passwordInput, 'Password required');

    await registrationPage.blurRepeatPassword();
    await registrationPage.expectInvalidField(
      registrationPage.repeatPasswordInput,
      'Re-enter password required',
    );
  });

  test('validates name format and length', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);

    await registrationPage.open();

    await registrationPage.nameInput.fill('A');
    await registrationPage.blurName();
    await registrationPage.expectInvalidField(
      registrationPage.nameInput,
      'Name has to be from 2 to 20 characters long',
    );

    await registrationPage.nameInput.fill('Anna1');
    await registrationPage.blurName();
    await registrationPage.expectInvalidField(registrationPage.nameInput, 'Name is invalid');
  });

  test('rejects Cyrillic characters in name', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);

    await registrationPage.open();

    await registrationPage.nameInput.fill('Іван');
    await registrationPage.blurName();
    await registrationPage.expectInvalidField(registrationPage.nameInput, 'Name is invalid');

    await registrationPage.nameInput.fill('Иван');
    await registrationPage.blurName();
    await registrationPage.expectInvalidField(registrationPage.nameInput, 'Name is invalid');
  });

  test('validates last name format and length', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);

    await registrationPage.open();

    await registrationPage.lastNameInput.fill('B'.repeat(21));
    await registrationPage.blurLastName();
    await registrationPage.expectInvalidField(
      registrationPage.lastNameInput,
      'Last name has to be from 2 to 20 characters long',
    );

    await registrationPage.lastNameInput.fill('Tester1');
    await registrationPage.blurLastName();
    await registrationPage.expectInvalidField(registrationPage.lastNameInput, 'Last name is invalid');
  });

  test('validates incorrect email', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);

    await registrationPage.open();

    await registrationPage.emailInput.fill('aqa-codex-email');
    await registrationPage.blurEmail();

    await registrationPage.expectInvalidField(registrationPage.emailInput, 'Email is incorrect');
  });

  test('rejects email with spaces inside', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);

    await registrationPage.open();

    await registrationPage.emailInput.fill('test @domain.com');
    await registrationPage.blurEmail();

    await registrationPage.expectInvalidField(registrationPage.emailInput, 'Email is incorrect');
  });

  test('shows errors when user enters incorrect registration data', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);

    await registrationPage.open();
    await registrationPage.fillForm({
      name: 'Anna1',
      lastName: 'Tester1',
      email: 'aqa-codex-email',
      password: 'password',
      repeatPassword: 'Password2',
    });

    await registrationPage.blurName();
    await registrationPage.blurLastName();
    await registrationPage.blurEmail();
    await registrationPage.blurPassword();
    await registrationPage.blurRepeatPassword();

    await registrationPage.expectInvalidField(registrationPage.nameInput, 'Name is invalid');
    await registrationPage.expectInvalidField(registrationPage.lastNameInput, 'Last name is invalid');
    await registrationPage.expectInvalidField(registrationPage.emailInput, 'Email is incorrect');
    await registrationPage.expectInvalidField(registrationPage.passwordInput, passwordRulesError);
    await registrationPage.expectInvalidField(
      registrationPage.repeatPasswordInput,
      'Passwords do not match',
    );
  });

  test('validates password rules', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);

    await registrationPage.open();

    await registrationPage.passwordInput.fill('password');
    await registrationPage.blurPassword();

    await registrationPage.expectInvalidField(registrationPage.passwordInput, passwordRulesError);
  });

  test('rejects password with only special characters', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);

    await registrationPage.open();

    await registrationPage.passwordInput.fill('!@#$%^&*()_+');
    await registrationPage.blurPassword();

    await registrationPage.expectInvalidField(registrationPage.passwordInput, passwordRulesError);
  });

  test('validates repeated password match', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);

    await registrationPage.open();

    await registrationPage.passwordInput.fill('Password1');
    await registrationPage.repeatPasswordInput.fill('Password2');
    await registrationPage.blurRepeatPassword();

    await registrationPage.expectInvalidField(
      registrationPage.repeatPasswordInput,
      'Passwords do not match',
    );
  });

  test('disables Register button and does not send request when any field is invalid', async ({
    page,
  }) => {
    let signupRequestWasSent = false;
    const registrationPage = new RegistrationPage(page);

    await page.route('**/api/auth/signup', async route => {
      signupRequestWasSent = true;
      await route.fulfill({ status: 500, body: 'Unexpected signup request' });
    });

    await registrationPage.open();
    await registrationPage.fillForm({
      name: 'Anna',
      lastName: 'Tester',
      email: getRandomEmail(),
      password: 'Password1',
      repeatPassword: 'Password1',
    });

    await expect(registrationPage.registerButton).toBeEnabled();

    await registrationPage.emailInput.fill('test @domain.com');
    await registrationPage.blurEmail();

    await registrationPage.expectInvalidField(registrationPage.emailInput, 'Email is incorrect');
    await expect(registrationPage.registerButton).toBeDisabled();
    expect(signupRequestWasSent).toBe(false);
  });

  test('does not allow registration with an existing email', async ({ page, request }) => {
    const registrationPage = new RegistrationPage(page);
    const email = getRandomEmail();
    const password = 'Password1';

    const response = await request.post('/api/auth/signup', {
      data: {
        name: 'Anna',
        lastName: 'Tester',
        email,
        password,
        repeatPassword: password,
      },
    });
    await expect(response).toBeOK();

    await registrationPage.open();
    await registrationPage.fillForm({
      name: 'Anna',
      lastName: 'Tester',
      email,
      password,
      repeatPassword: password,
    });

    await expect(registrationPage.registerButton).toBeEnabled();
    await registrationPage.submit();

    await expect(page.getByText('User already exists', { exact: true })).toBeVisible();
    await expect(page).not.toHaveURL(/\/panel\/garage/);
  });
});

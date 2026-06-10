import { expect, type Locator, type Page } from '@playwright/test';

export type RegistrationUser = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  repeatPassword: string;
};

export class RegistrationPage {
  readonly page: Page;

  get modal(): Locator {
    return this.page.locator('.modal-content').filter({ hasText: 'Registration' }).last();
  }

  get nameInput(): Locator {
    return this.modal.locator('#signupName');
  }

  get lastNameInput(): Locator {
    return this.modal.locator('#signupLastName');
  }

  get emailInput(): Locator {
    return this.modal.locator('#signupEmail');
  }

  get passwordInput(): Locator {
    return this.modal.locator('#signupPassword');
  }

  get repeatPasswordInput(): Locator {
    return this.modal.locator('#signupRepeatPassword');
  }

  get registerButton(): Locator {
    return this.modal.getByRole('button', { name: 'Register' });
  }

  constructor(page: Page) {
    this.page = page;
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await this.page.getByRole('button', { name: 'Sign In' }).click();
    await this.page.getByRole('button', { name: 'Registration' }).click();
    await expect(this.modal.getByRole('heading', { name: 'Registration' })).toBeVisible();
  }

  async fillForm(user: RegistrationUser): Promise<void> {
    await this.nameInput.fill(user.name);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.repeatPasswordInput.fill(user.repeatPassword);
  }

  async blurName(): Promise<void> {
    await this.blurField(this.nameInput);
  }

  async blurLastName(): Promise<void> {
    await this.blurField(this.lastNameInput);
  }

  async blurEmail(): Promise<void> {
    await this.blurField(this.emailInput);
  }

  async blurPassword(): Promise<void> {
    await this.blurField(this.passwordInput);
  }

  async blurRepeatPassword(): Promise<void> {
    await this.blurField(this.repeatPasswordInput);
  }

  async submit(): Promise<void> {
    await this.registerButton.click();
  }

  async expectInvalidField(field: Locator, message: string): Promise<void> {
    await expect(this.modal.getByText(message, { exact: true })).toBeVisible();
    await expect(field).toHaveClass(/is-invalid/);
    await expect(this.registerButton).toBeDisabled();
  }

  private async blurField(field: Locator): Promise<void> {
    await field.focus();
    await field.blur();
  }
}

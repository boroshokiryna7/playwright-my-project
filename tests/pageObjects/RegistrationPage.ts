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
  readonly modal: Locator;
  readonly nameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly repeatPasswordInput: Locator;
  readonly registerButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator('.modal-content').filter({ hasText: 'Registration' }).last();
    this.nameInput = this.modal.locator('#signupName');
    this.lastNameInput = this.modal.locator('#signupLastName');
    this.emailInput = this.modal.locator('#signupEmail');
    this.passwordInput = this.modal.locator('#signupPassword');
    this.repeatPasswordInput = this.modal.locator('#signupRepeatPassword');
    this.registerButton = this.modal.getByRole('button', { name: 'Register' });
  }

  async open(baseUrl: string): Promise<void> {
    await this.page.goto(baseUrl);
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

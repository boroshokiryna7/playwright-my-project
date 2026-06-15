const { expect } = require('@playwright/test');

class RegistrationPage {
  get modal() {
    return this.page.locator('.modal-content').filter({ hasText: 'Registration' }).last();
  }

  get nameInput() {
    return this.modal.locator('#signupName');
  }

  get lastNameInput() {
    return this.modal.locator('#signupLastName');
  }

  get emailInput() {
    return this.modal.locator('#signupEmail');
  }

  get passwordInput() {
    return this.modal.locator('#signupPassword');
  }

  get repeatPasswordInput() {
    return this.modal.locator('#signupRepeatPassword');
  }

  get registerButton() {
    return this.modal.getByRole('button', { name: 'Register' });
  }

  constructor(page) {
    this.page = page;
  }

  async open() {
    await this.page.goto('/');
    await this.page.getByRole('button', { name: 'Sign In' }).click();
    await this.page.getByRole('button', { name: 'Registration' }).click();
    await expect(this.modal.getByRole('heading', { name: 'Registration' })).toBeVisible();
  }

  async fillForm(user) {
    await this.nameInput.fill(user.name);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.repeatPasswordInput.fill(user.repeatPassword);
  }

  async blurName() {
    await this.blurField(this.nameInput);
  }

  async blurLastName() {
    await this.blurField(this.lastNameInput);
  }

  async blurEmail() {
    await this.blurField(this.emailInput);
  }

  async blurPassword() {
    await this.blurField(this.passwordInput);
  }

  async blurRepeatPassword() {
    await this.blurField(this.repeatPasswordInput);
  }

  async submit() {
    await this.registerButton.click();
  }

  async expectInvalidField(field, message) {
    await expect(this.modal.getByText(message, { exact: true })).toBeVisible();
    await expect(field).toHaveClass(/is-invalid/);
    await expect(this.registerButton).toBeDisabled();
  }

  async blurField(field) {
    await field.focus();
    await field.blur();
  }
}

module.exports = { RegistrationPage };

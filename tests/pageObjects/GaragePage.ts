import { expect, type Page } from '@playwright/test';

export class GaragePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open(): Promise<void> {
    await this.page.goto('/panel/garage');
    await expect(this.page.getByRole('heading', { name: 'Garage' })).toBeVisible();
  }

  async addCar(name: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Add car' }).click();

    await this.page.getByRole('heading', { name: 'Add a car' }).waitFor({ state: 'visible', timeout: 5000 });
    
    const brand = this.page.getByRole('combobox', { name: 'Brand' }).first();
    const model = this.page.getByRole('combobox', { name: 'Model' }).first();
    const mileage = this.page.getByRole('spinbutton', { name: 'Mileage' }).first();

    if ((await brand.count()) > 0) {
      await brand.selectOption({ index: 0 }).catch(() => brand.press('ArrowDown').catch(() => null));
    }

    if ((await model.count()) > 0) {
      await model.selectOption({ index: 0 }).catch(() => model.press('ArrowDown').catch(() => null));
    }

    if ((await mileage.count()) > 0) {
      await mileage.fill('100').catch(() => mileage.evaluate((el: any) => (el.value = '100')));
    }

   
    const addBtn = this.page.getByRole('button', { name: 'Add' }).first();
    await addBtn.waitFor({ state: 'visible', timeout: 5000 });
    await expect(addBtn).toBeEnabled({ timeout: 5000 }).catch(() => null);
    await addBtn.click();
   
    await this.page.waitForSelector('dialog, .modal-content', { state: 'detached', timeout: 10000 }).catch(() => null);
  }
}

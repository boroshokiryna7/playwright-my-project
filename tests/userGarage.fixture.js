const { test: base, expect } = require('@playwright/test');
const { GaragePage } = require('./pageObjects/GaragePage');

const test = base.extend({
  userGaragePage: async ({ page }, use) => {
    const garagePage = new GaragePage(page);
    await garagePage.open();
    await use(garagePage);
  },
});

module.exports = { test, expect };

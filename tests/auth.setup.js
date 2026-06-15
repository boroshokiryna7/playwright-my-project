const { test: setup } = require('@playwright/test');
const { RegistrationPage } = require('./pageObjects/RegistrationPage');

setup.setTimeout(120000);

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page, request }, testInfo) => {
  try {
    const base = process.env.BASE_URL || '';
    const signupEmail = process.env.USER_EMAIL || 'guest@test.com';
    const signupPassword = process.env.USER_PASSWORD || process.env.HTTP_PASSWORD || 'welcome2qauto';
    const signupData = {
      name: 'Setup',
      lastName: 'User',
      email: signupEmail,
      password: signupPassword,
      repeatPassword: signupPassword,
    };
    try {
      const signupRes = await request.post('/api/auth/signup', { data: signupData });
      const signupText = await signupRes.text().catch(() => '');
      await testInfo.attach('signup-response', { body: Buffer.from(signupText), contentType: 'text/plain' });
      if (![200, 201, 409].includes(signupRes.status())) {
        throw new Error('Signup failed: ' + signupRes.status());
      }
    } catch (e) {
      await testInfo.attach('signup-error', { body: Buffer.from(String(e)), contentType: 'text/plain' });
    }

    try {
      const loginRes = await request.post('/api/auth/login', { data: { email: signupEmail, password: signupPassword } });
      const loginText = await loginRes.text().catch(() => '');
      await testInfo.attach('login-response', { body: Buffer.from(loginText), contentType: 'text/plain' });
      if (![200, 201].includes(loginRes.status())) {
        await testInfo.attach('login-status', { body: Buffer.from(String(loginRes.status())), contentType: 'text/plain' });
      }
    } catch (e) {
      await testInfo.attach('login-error', { body: Buffer.from(String(e)), contentType: 'text/plain' });
    }

    const username = process.env.HTTP_USERNAME || '';
    const password = process.env.HTTP_PASSWORD || '';
    const loginEmail = process.env.USER_EMAIL || process.env.HTTP_USERNAME || 'guest@test.com';
    const loginPassword = process.env.USER_PASSWORD || process.env.HTTP_PASSWORD || 'welcome2qauto';
    const browser = await page.context().browser();
    if (!browser) throw new Error('Browser instance is not available');
    const authContext = await browser.newContext({ httpCredentials: username && password ? { username, password } : undefined, baseURL: base });
    const authPage = await authContext.newPage();
    let saved = false;
    try {
      const target = process.env.BASE_URL || '/';
      await authPage.goto(target);
      await authPage.waitForLoadState('networkidle');

      const signInRole = authPage.getByRole('button', { name: /sign\s*in/i });
      const signInText = authPage.getByText(/sign\s*in/i);

      if ((await signInRole.count()) > 0) {
        await signInRole.first().click({ timeout: 60000 });
      } else if ((await signInText.count()) > 0) {
        await signInText.first().click({ timeout: 60000 });
      } else if ((await authPage.locator('a:has-text("Sign in"), a:has-text("Sign In")').count()) > 0) {
        await authPage.locator('a:has-text("Sign in"), a:has-text("Sign In")').first().click({ timeout: 60000 });
      }

      const emailLocator = authPage.getByLabel(/email/i).first();
      const passwordLocator = authPage.getByLabel(/password/i).first();

      if ((await emailLocator.count()) === 0) {
        await authPage.locator('input[placeholder*="email" i], input[name*=email]').first().fill(loginEmail);
      } else {
        await emailLocator.fill(loginEmail);
      }

      if ((await passwordLocator.count()) === 0) {
        await authPage.locator('input[placeholder*="password" i], input[name*=password]').first().fill(loginPassword);
      } else {
        await passwordLocator.fill(loginPassword);
      }

      const submit = authPage.getByRole('button', { name: /sign\s*in|log in|login|submit/i });
      if ((await submit.count()) > 0) {
        await submit.first().click({ timeout: 60000 });
      } else if ((await authPage.locator('button[type=submit], input[type=submit]').count()) > 0) {
        await authPage.locator('button[type=submit], input[type=submit]').first().click({ timeout: 60000 });
      } else {
        try {
          await passwordLocator.press('Enter');
        } catch {
          const pwdFallback = authPage.locator('input[placeholder*=\"password\" i], input[name*=password]').first();
          await pwdFallback.press('Enter').catch(() => null);
        }
        await authPage.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => null);
        await authPage.evaluate(() => {
          const f = document.querySelector('form');
          if (f) f.submit();
        });
      }

      try {
        await authPage.waitForURL('**/panel/**', { timeout: 60000 });
      } catch (e) {
        const reg = new RegistrationPage(authPage);
        try {
          await reg.open();
          await reg.fillForm({ name: 'Setup', lastName: 'User', email: signupEmail, password: signupPassword, repeatPassword: signupPassword });
          await reg.submit();
          await authPage.waitForURL('**/panel/**', { timeout: 60000 });
        } catch (uiErr) {
          throw e;
        }
      }

      await authContext.storageState({ path: authFile });
      saved = true;
    } catch (innerErr) {
      const aScreenshot = await authPage.screenshot({ fullPage: true }).catch(() => null);
      if (aScreenshot) {
        await testInfo.attach('auth-page-screenshot', { body: aScreenshot, contentType: 'image/png' });
      }
      const aHtml = await authPage.content().catch(() => '');
      if (aHtml) {
        await testInfo.attach('auth-page-html', { body: Buffer.from(aHtml), contentType: 'text/html' });
      }
      throw innerErr;
    } finally {
      await authPage.close();
      await authContext.close();
    }
    if (saved) {
      return;
    }

    const signInRole = page.getByRole('button', { name: /sign\s*in/i });
    const signInText = page.getByText(/sign\s*in/i);

    if ((await signInRole.count()) > 0) {
      await signInRole.first().click({ timeout: 60000 });
    } else if ((await signInText.count()) > 0) {
      await signInText.first().click({ timeout: 60000 });
    } else {
      await page.locator('a:has-text("Sign in"), a:has-text("Sign In")').first().click({ timeout: 60000 });
    }

    const emailLocator = page.getByLabel(/email/i).first();
    const passwordLocator = page.getByLabel(/password/i).first();

    if ((await emailLocator.count()) === 0) {
      await page.locator('input[placeholder*="email" i], input[name*=email]').first().fill(process.env.USER_EMAIL || process.env.HTTP_USERNAME || 'guest@test.com');
    } else {
      await emailLocator.fill(process.env.USER_EMAIL || process.env.HTTP_USERNAME || 'guest@test.com');
    }

    if ((await passwordLocator.count()) === 0) {
      await page.locator('input[placeholder*="password" i], input[name*=password]').first().fill(process.env.USER_PASSWORD || process.env.HTTP_PASSWORD || 'welcome2qauto');
    } else {
      await passwordLocator.fill(process.env.USER_PASSWORD || process.env.HTTP_PASSWORD || 'welcome2qauto');
    }

    const submit = page.getByRole('button', { name: /sign\s*in|log in|login|submit/i });
    if ((await submit.count()) > 0) {
      await submit.first().click({ timeout: 60000 });
    } else if ((await page.locator('button[type=submit], input[type=submit]').count()) > 0) {
      await page.locator('button[type=submit], input[type=submit]').first().click({ timeout: 60000 });
    } else {
      try {
        await passwordLocator.press('Enter');
      } catch {
        const pwdFallback = page.locator('input[placeholder*=\"password\" i], input[name*=password]').first();
        await pwdFallback.press('Enter').catch(() => null);
      }
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => null);
      await page.evaluate(() => {
        const f = document.querySelector('form');
        if (f) f.submit();
      });
    }

    await page.waitForURL('**/panel/**', { timeout: 60000 });

    await page.context().storageState({ path: authFile });
  } catch (err) {
    const screenshot = await page.screenshot({ fullPage: true }).catch(() => null);
    if (screenshot) {
      await testInfo.attach('failed-page-screenshot', { body: screenshot, contentType: 'image/png' });
    }
    const html = await page.content().catch(() => '');
    await testInfo.attach('failed-page-html', { body: Buffer.from(html), contentType: 'text/html' });
    throw err;
  }
});

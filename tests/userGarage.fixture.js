const { expect, request } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'https://qauto.forstudy.space';
const httpCredentials = {
  username: process.env.HTTP_USERNAME || 'guest',
  password: process.env.HTTP_PASSWORD || 'welcome2qauto',
};

function getRandomEmail() {
  return `test-${Date.now()}-${Math.floor(Math.random() * 10000)}@mail.com`;
}

async function createUserApiContext() {
  const client = await request.newContext({
    baseURL,
    httpCredentials,
  });

  const password = 'Password1';
  const response = await client.post('/api/auth/signup', {
    data: {
      name: 'John',
      lastName: 'Dou',
      email: getRandomEmail(),
      password,
      repeatPassword: password,
    },
  });

  expect(response.status()).toBe(201);

  return client;
}

async function loginPageByApi(page) {
  const client = await createUserApiContext();
  const storageState = await client.storageState();

  await page.context().addCookies(storageState.cookies);
  await client.dispose();
}

module.exports = {
  createUserApiContext,
  loginPageByApi,
};

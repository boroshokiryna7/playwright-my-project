const { test, expect } = require('@playwright/test');
const { createUserApiContext } = require('./userGarage.fixture');

test.describe('QAuto cars API', () => {
  let client;

  test.beforeEach(async () => {
    client = await createUserApiContext();
  });

  test.afterEach(async () => {
    if (client) {
      await client.dispose();
    }
  });

  test('creates a car with valid data', async () => {
    const response = await client.post('/api/cars', {
      data: {
        carBrandId: 1,
        carModelId: 1,
        mileage: 122,
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body.status).toBe('ok');
    expect(body.data.carBrandId).toBe(1);
    expect(body.data.carModelId).toBe(1);
    expect(body.data.mileage).toBe(122);
    expect(body.data.brand).toBe('Audi');
    expect(body.data.model).toBe('TT');
  });

  test('does not create a car without carBrandId', async () => {
    const response = await client.post('/api/cars', {
      data: {
        carModelId: 1,
        mileage: 122,
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body).toEqual({
      status: 'error',
      message: 'Car brand id is required',
    });
  });

  test('does not create a car with invalid mileage', async () => {
    const response = await client.post('/api/cars', {
      data: {
        carBrandId: 1,
        carModelId: 1,
        mileage: -1,
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body).toEqual({
      status: 'error',
      message: 'Mileage has to be from 0 to 999999',
    });
  });
});

import { test, expect } from './userGarage.fixture';

test('user can see garage and add a car', async ({ userGaragePage }) => {
  await userGaragePage.addCar('My Car');
  const emptyMsg = userGaragePage.page.getByText("You don’t have any cars in your garage");
  await emptyMsg.waitFor({ state: 'detached', timeout: 10000 }).catch(() => null);
  await expect(emptyMsg).toBeHidden();
});

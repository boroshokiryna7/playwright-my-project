import { readFileSync } from 'fs';

const envFile = readFileSync('.env', 'utf-8');

for (const line of envFile.split('\n')) {
  const [key, value] = line.trim().split('=');

  if (key && value) {
    process.env[key] = value;
  }
}

export const environment = {
  baseUrl: process.env.BASE_URL as string,
  httpCredentials: {
    username: process.env.HTTP_USERNAME as string,
    password: process.env.HTTP_PASSWORD as string,
  },
};

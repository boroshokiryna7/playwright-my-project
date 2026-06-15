const { readFileSync } = require('fs');

const envFile = readFileSync('.env', 'utf-8');

for (const line of envFile.split('\n')) {
  const [key, value] = line.trim().split('=');

  if (key && value) {
    process.env[key] = value;
  }
}

const environment = {
  baseUrl: process.env.BASE_URL,
  httpCredentials: {
    username: process.env.HTTP_USERNAME,
    password: process.env.HTTP_PASSWORD,
  },
};

module.exports = { environment };

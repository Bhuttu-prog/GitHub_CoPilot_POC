import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), 'env/.env'), quiet: true });

function readRequired(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable "${name}". Copy env/.env.example to env/.env and set it.`);
  }
  return value;
}

export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://rahulshettyacademy.com',
  headless: process.env.HEADLESS !== 'false',
  isCI: Boolean(process.env.CI),
  get loginUsername(): string {
    return readRequired('LOGIN_USERNAME');
  },
  get loginPassword(): string {
    return readRequired('LOGIN_PASSWORD');
  },
};

import { env } from '@config/env';

export type Credentials = { username: string; password: string };
export type UserType = 'admin' | 'user';
export type Occupation = 'Student' | 'Teacher' | 'Consultant';

export const users = {
  get valid(): Credentials {
    return { username: env.loginUsername, password: env.loginPassword };
  },
  get retiredPassword(): Credentials {
    return { username: env.loginUsername, password: 'learning' };
  },
  get invalidPassword(): Credentials {
    return { username: env.loginUsername, password: 'WrongPassword@123' };
  },
  get unknownUser(): Credentials {
    return { username: 'unknown.user', password: env.loginPassword };
  },
  emptyCredentials: { username: '', password: '' },
} satisfies Record<string, Credentials>;

export const loginMessages = {
  incorrect: 'Incorrect username/password.',
  empty: 'Empty username/password.',
  retiredPassword: 'Old password "learning" is no longer valid.',
} as const;

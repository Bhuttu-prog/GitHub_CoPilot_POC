export const greenKartProducts = {
  tomato: 'Tomato - 1 Kg',
  brocolli: 'Brocolli - 1 Kg',
  cashews: 'Cashews - 1 Kg',
} as const;

export const searchScenarios = [
  { keyword: 'ca', expected: ['Cauliflower - 1 Kg', 'Carrot - 1 Kg', 'Capsicum', 'Cashews - 1 Kg'] },
  { keyword: 'Tom', expected: ['Tomato - 1 Kg'] },
  { keyword: 'BER', expected: ['Cucumber - 1 Kg', 'Raspberry - 1/4 Kg', 'Strawberry - 1/4 Kg'] },
] as const;

export const promoCodes = {
  valid: { code: 'rahulshettyacademy', discountPercentage: 10, message: 'Code applied ..!' },
  invalid: { code: 'INVALID2026', message: 'Invalid code ..!' },
} as const;

export const greenKartMessages = {
  termsRequired: 'Please accept Terms & Conditions - Required',
} as const;

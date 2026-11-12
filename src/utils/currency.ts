export function parseAmount(text: string): number {
  const numeric = text.replace(/[^\d.]/g, '').replace(/^\.+|\.+$/g, '');
  const amount = Number(numeric);
  if (numeric === '' || Number.isNaN(amount)) {
    throw new Error(`Unable to parse amount from "${text}"`);
  }
  return amount;
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

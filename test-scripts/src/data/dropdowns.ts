export const currencies = ['Select', 'INR', 'AED', 'USD'] as const;

export const countrySuggestions = {
  searchText: 'ind',
  country: 'India',
  matches: ['British Indian Ocean Territory', 'India', 'Indonesia'],
  unknown: 'zzz',
} as const;

export const cities = {
  departure: 'Bengaluru (BLR)',
  arrival: 'Chennai (MAA)',
} as const;

export const passengers = {
  addedAdults: 1,
  addedChildren: 1,
  summary: '2 Adult, 1 Child',
  minimumAdults: 1,
  maximumAdults: 9,
} as const;

export const tripDateOpacity = {
  inactive: '0.5',
  active: '1',
} as const;
